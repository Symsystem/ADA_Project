import pandas as pd
import numpy as np
import csv
import json
from datetime import datetime
from shapely.geometry import Point, shape



def convert_to_unix_time(record):
    datetime_index = pd.DatetimeIndex([datetime(record['year'], record['month'], 1)])
    unix_time_index = datetime_index.astype(np.int64) // 10**6
    return unix_time_index[0]


def get_id_from_geoJSON(record, filename):
    point = Point(record['longitude'], record['latitude'])

    for feature in filename['features']:
        if (feature['geometry']['type'] == 'Polygon'):
            polygon = shape(feature['geometry'])
            if polygon.contains(point):
                return feature['properties']['id']
        elif (feature['geometry']['type'] == 'MultiPolygon'):
            multipolygon = shape(feature['geometry'])
            for polygon in multipolygon:
                if polygon.contains(point):
                    return feature['properties']['id']


def create_json_file(canton_municipality, grouped_dataframe, output_filename):
    '''Create JSON FILE
    c for cantons
    m for municipalities
    '''

    dates_list = list(grouped_dataframe.index.levels[0])
    ids_list = list(grouped_dataframe.index.levels[1])

    if canton_municipality == 'c':
        main_object = 'cantons'
    else:
        main_object = 'municipalities'

    json_file = dict()
    json_file[main_object] = list()

    for date_index in range(len(dates_list)):
         json_file[main_object].append(dict())
         json_file[main_object][date_index]['date'] = int(dates_list[date_index])
         json_file[main_object][date_index]['data'] = list()

         for id_index in range(len(ids_list)):
             json_file[main_object][date_index]['data'].append(dict())
             json_file[main_object][date_index]['data'][id_index]['id'] = int(ids_list[id_index])
             json_file[main_object][date_index]['data'][id_index]['nbr'] = int(grouped_dataframe[(dates_list[date_index],
                                                                                                  ids_list[id_index])])

    with open(output_filename, 'w') as file:
        json.dump(json_file, file)


# Grouping by time and by id for all the 2MB file and saving
for i in range(1995,3989) :

    try :

        print('current file :' + str(i))
        path = '../../../twitter-swisscom/Divided_Predicted/sentiments_renamed.tsv.00' + str(i)
        df_data = pd.read_csv(path, sep=r',', encoding='utf-8', escapechar='\\', header=0,
                                      na_values=r'\N', engine='python')

        df_data.dropna(subset=['latitude', 'longitude'], inplace=True)



        ##### DATE #####
        df_data['year'] = pd.DatetimeIndex(df_data['date']).year
        df_data['month'] = pd.DatetimeIndex(df_data['date']).month


        df_data['unix_time'] = df_data.apply(convert_to_unix_time, axis=1)

        df_data.drop(['date', 'year', 'month','content'], axis=1, inplace=True)




        ###### Localisation #####
        # read geoJSON file with canton names and IDs
        path_cantons = '../../res/topo/ch-cantons-geo.json'

        with open(path_cantons) as file:
            cantons_json = json.load(file)

        df_data['canton_id'] = df_data.apply(get_id_from_geoJSON, args=(cantons_json,), axis=1)
        df_data.dropna(subset=['canton_id'], inplace=True)

        path_towns = '../../res/topo/ch-municipalities-geo.json'

        with open(path_towns) as file:
            towns_json = json.load(file)

        df_data['town_id'] = df_data.apply(get_id_from_geoJSON, args=(towns_json,), axis=1)


        # Grouping by localtion
        df_data['sentiment'] = 2*df_data['sentiment'] -1
        grouped_year_canton = df_data.groupby(['unix_time', 'canton_id'])['sentiment'].mean()
        grouped_year_town = df_data.groupby(['unix_time', 'town_id'])['sentiment'].mean()



        # Saving the files
        print('----- saving -------')

        grouped_year_canton.to_csv( '../../../twitter-swisscom/Final_Data/Canton/sentiment_canton'+str(i))

        grouped_year_town.to_csv( '../../../twitter-swisscom/Final_Data/Town/sentiment_town'+str(i))

    except (RuntimeError, TypeError, NameError, ValueError, UnicodeDecodeError):\
        print("Error")



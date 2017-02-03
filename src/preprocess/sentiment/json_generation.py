import pandas as pd
import numpy as np
import csv
import json
from datetime import datetime
from shapely.geometry import Point, shape
import os



def create_json_file(canton_municipality, grouped_dataframe, output_filename):
    '''Creating JSON File'''
    dates_list = list(grouped_dataframe.index.levels[0])

    ids_list = list(grouped_dataframe.index.levels[1])
    print('ids_list',ids_list)
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
             print('date',dates_list[date_index])
             print(ids_list)
             print('id',ids_list[id_index])
             json_file[main_object][date_index]['data'].append(dict())
             json_file[main_object][date_index]['data'][id_index]['id'] = int(ids_list[id_index])
             try :
                json_file[main_object][date_index]['data'][id_index]['nbr'] = grouped_dataframe[(dates_list[date_index],ids_list[id_index])]
             except (KeyError):
                 pass
                 #json_file[main_object][date_index]['data'][id_index]['nbr'] = 0

    with open(output_filename, 'w') as file:
         json.dump(json_file, file)



path_canton = '../../../twitter-swisscom/Final_Data/Canton/'

path_city = '../../../twitter-swisscom/Final_Data/Town/'
# df_canton = pd.DataFrame(columns=['unix_time', 'town_id', 'c'])
# df_town = pd.DataFrame(columns=['unix_time', 'town_id', 'c'])
# print(df_canton)
#
# for filename in os.listdir(path_canton):
#     try :
#     # Grouping by localtion
#         df_data = pd.read_csv(path_canton+filename,names=['unix_time', 'town_id', 'c'], sep=r',', encoding='utf-8', escapechar='\\', header=0,
#                               na_values=r'\N', engine='python')
#         #print(df_data)
#         #print("df_data ------ shape :",df_data.shape)
#         df_canton = df_data.append(df_canton, ignore_index=True)
#
#         #print("df_canton ------ shape ",df_canton.shape)
#
#     except (TypeError) :
#         print('Error')
#
#
# for filename in os.listdir(path_city):
#     df_data = pd.read_csv(path_city+filename, sep=r',',names=['unix_time', 'town_id', 'c'], encoding='utf-8', escapechar='\\', header=0,
#                               na_values=r'\N', engine='python')
#     df_town =df_town.append( df_data, ignore_index=True)

df_data_canton = pd.read_csv('canton',names=['unix_time', 'town_id', 'c'], sep=r',', encoding='utf-8', escapechar='\\', header=0,
                              na_values=r'\N', engine='python')
df_data_town = pd.read_csv('town',names=['unix_time', 'town_id', 'c'], sep=r',', encoding='utf-8', escapechar='\\', header=0,
                              na_values=r'\N', engine='python')
grouped_year_canton = df_data_canton.groupby(['unix_time', 'town_id'])['c'].mean()
grouped_year_town = df_data_town.groupby(['unix_time', 'town_id'])['c'].mean()

#grouped_year_canton.to_csv('canton')

#grouped_year_town.to_csv('town')

print(grouped_year_canton)
#print(grouped_year_canton.shape)

create_json_file('c', grouped_year_canton, '../../res/sentiment/canton_sentiment.json')

create_json_file('m', grouped_year_town, '../../res/sentiment/municipality_sentiment.json')


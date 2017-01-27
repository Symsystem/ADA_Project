import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
import csv
from langdetect import DetectorFactory
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
import csv

''' delete all the columns except :
Name of the collumn      Number
- id                    0
- date                  2
- content               3
- latitude              10
- longitude             11
- number of followers   17
- number of friends     18
- user location         20
'''

map_columns = ['id', 'userId', 'date', 'content', 'longitude', 'latitude', 'placeId', 'inReplyTo', 'source',
               'truncated', 'placeLatitude', 'placeLongitude', 'sourceName', 'sourceUrl', 'userName', 'screenName',
               'followers', 'friends', 'statusesCount', 'userLocation']


def get_datas(path, columns, nbrRows=None):
    index_columns = []
    for name in columns:
        index_columns.append(map_columns.index(name))

    # df_data = pd.read_csv(path, delimiter=r'\t', nrows=70, encoding='utf-8', quoting=csv.QUOTE_NONE)[index_columns]
    df_data = pd.read_csv(path, sep=r'\t', encoding='utf-8', escapechar='\\', quoting=csv.QUOTE_NONE, header=None,
                          na_values=r'\N', nrows=nbrRows, engine='python')[index_columns]
    df_data.columns = columns
    return df_data


def clean_data(data, columns_to_clean_na, columns_to_keep):
    #for col in columns_to_clean_na:
    #    data = data[data[col] != r'\N']
    data = data[columns_to_keep]
    data.dropna(subset=columns_to_clean_na, inplace=True)
    return data


def get_locations(data):
    geolocator = Nominatim()
    for index, row in data.iterrows():
        location = geolocator.reverse((row['latitude'], row['longitude']))
        print(location.raw)
        if location.raw['address']['country_code'] == "ch":
            data.set_value(index, 'canton', location.raw['address']['state'])
            if 'city' in location.raw['address']:
                data.set_value(index, 'town', location.raw['address']['city'])
            elif 'town' in location.raw['address']:
                data.set_value(index, 'town', location.raw['address']['town'])
            else:
                data.set_value(index, 'town', location.raw['address']['village'])
    return data


def get_total_canton(data):
    return data.groupby(['canton', 'date']).size().rename('tweets')


def get_total_municipality(data):
    return data.groupby(['canton', 'town']).size().rename('tweets')


def clean_data(data, columns_to_clean_na, columns_to_keep):
    for col in columns_to_clean_na:
        data = data[data[col] != r'\N']
    return data[columns_to_keep]


def add_language(language, df) :
    DetectorFactory.seed = 100

    df.dropna(inplace=True,subset = ['content'])
    error = 0
    list = []
    compteur = 0
    for sample in df['content'] :
        compteur +=1
        try:
            list.append(detect(sample))

        except (RuntimeError, TypeError, NameError,LangDetectException) :
            error +=1
            list.append('NaN')

    df['language']= list
    print("number of errors :",error)
    print("file size : ",df[df['language'] == language].shape )
    return df[df['language'] == language]


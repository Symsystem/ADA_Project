import pandas as pd
import numpy as np

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


def get_datas(path, columns):
    index_columns = []
    for name in columns:
        index_columns.append(map_columns.index(name))

    df_data = pd.read_csv(path, delimiter='\t', nrows=9760, encoding='utf-8')[index_columns]
    df_data.columns = columns
    return df_data


def clean_data(data, columns_to_clean_na, columns_to_keep):
    for col in columns_to_clean_na:
        data = data[data[col] != r'\N']
    return data[columns_to_keep]

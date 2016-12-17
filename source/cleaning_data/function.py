import pandas as pd
import numpy as np

def get_datas(path) :
    df_data=pd.read_csv(path,delimiter='\t',nrows=20,encoding='utf-8')
    return  df_data

''' delete all the columns except :
Name of the collum      Number
- id                    0
- date                  2
- content               3
- latitude              10
- longitude             11
- number of followers   17
- number of friends     18
- statusesCount         19
- user location         20
'''
def delete_useless_columns(df_data) :
    return

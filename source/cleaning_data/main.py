import pandas as pd

from ADA_Project.source.cleaning_data.function import get_datas, clean_data

df = get_datas('../../twitter-swisscom/sample.tsv', ['id','date','content', 'latitude', 'longitude', 'followers','friends'])
df = clean_data(df, [ 'longitude','latitude'],  ['id','date', 'latitude', 'longitude', 'followers','friends'])

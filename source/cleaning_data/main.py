import pandas as pd

import source.cleaning_data.function as fct

df = fct.get_datas('../../twitter-swisscom/sample.tsv',
                   ['id', 'date', 'content', 'latitude', 'longitude', 'followers', 'friends'], 70)
df = fct.clean_data(df, ['longitude', 'latitude'], ['id', 'date', 'latitude', 'longitude', 'followers', 'friends'])

df = fct.get_locations(df)
df.dropna(subset=['canton', 'town'], inplace=True)

total_canton = fct.get_total_canton(df)
total_municipality = fct.get_total_municipality(df)
print(total_municipality)

total_canton.to_json(path_or_buf='../density_map/data/canton_density.json', orient='columns')
total_municipality.to_json(path_or_buf='../density_map/data/municipality_density.json', orient='columns')
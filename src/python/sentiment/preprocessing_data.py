
import pandas as pd
import numpy as np

from src.python.function import get_datas, add_language

df = get_datas('../../../twitter-swisscom/Divided/twex.tsv.001', ['id','content','longitude', 'latitude'])
add_language('en', df).to_csv('../../../twitter-swisscom/Divided/twex-en.tsv.001')



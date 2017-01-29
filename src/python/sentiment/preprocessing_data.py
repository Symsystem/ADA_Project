
import pandas as pd
import numpy as np


from src.python.function import get_datas, add_language
import csv


# Import the stop_words

stop_words_english = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']

stop_words_german = pd.read_csv('data/stopwords/german', sep=r'\t', encoding='utf-8', escapechar='\\', quoting=csv.QUOTE_NONE, header=None,
                              na_values=r'\N', engine='python')[0].tolist()

stop_words_french =pd.read_csv('data/stopwords/french', sep=r'\t', encoding='utf-8', escapechar='\\', quoting=csv.QUOTE_NONE, header=None,
                              na_values=r'\N', engine='python')[0].tolist()
stop_words_italian = pd.read_csv('data/stopwords/italian', sep=r'\t', encoding='utf-8', escapechar='\\', quoting=csv.QUOTE_NONE, header=None,
                              na_values=r'\N', engine='python')[0].tolist()

name =0


# TODO : This is a bit crude but we need speed, language detect is too slow use an other way ?
# filter the language for all 2MB file :
    # If there is a english stop word and no french, german or italian stopword the tweet is declared to be an english
    # tweet

for i in range(1,2048) :
    print("number is : ", str(i))
    try:
        with open('../../../twitter-swisscom/Divided/twex.tsv.00' + str(i), encoding='utf-8') as inputFile:
            lines = inputFile.readlines()
            res = []
            count = 0
            for line in lines:
                if len(line.split('\t')) == 20:
                    #print(bool(set(line.split('\t')[3].split()).intersection(stop_words)))

                    if bool(set(line.split('\t')[3].split()).intersection(stop_words_english)) :
                        if not (bool(set(line.split('\t')[3].split()).intersection(stop_words_german))) :
                            #print((bool(set(line.split('\t')[3].split()).intersection(stop_words_german))))

                            if not (bool(set(line.split('\t')[3].split()).intersection(stop_words_french))):
                                if not (bool(set(line.split('\t')[3].split()).intersection(stop_words_italian))):
                                    res.append(line)
                else:
                    count += 1

            print(count)
            with open("../../../twitter-swisscom/Divided_cleaned/twex-en.tsv.00" + str(name), encoding='utf-8',
                      mode='w') as outputFile:
                for line in res:
                    outputFile.write(line)
            name += 1


    except (RuntimeError, TypeError, NameError, ValueError, UnicodeDecodeError):
        print("Error")



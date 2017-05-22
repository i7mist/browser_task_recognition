# tabA vs tabB
# access pattern
# 1. For all previous access to the same tabA within k time interval, what is the normalized number of access to tabB? 
# 2. For all previous access to the same tabA within k time interval, what is the normalized time spent on tabB? (should be the same as the total time, since the time interval is specified)
# 3. For all previous access to the same tabA within k time interval and are not separated with tabA by a new Tab in between, what is the normalized number of access to tabB?
# 4. For all previous access to the same tabA within k time interval and are not separated with tabA by a new Tab in between, what's the normalized time spent on tabB? (should be the same as the total time, since the time interval is specified)

# content
# 1. whether has the same domain name?
# 2. how many same words that are not stop words?

import sys
import json
import arff

log_file = sys.argv[1]

with open(log_file) as data_file:
    log_data = json.load(data_file)

new_tab_id_begin = 0
new_tab_id_end = 512

tab_history_begin = 0
tab_history_end = 1137

tab_list = []
tab_history_list = []

# load data
for i in range(new_tab_id_begin, new_tab_id_end+1):
    tab_list.append(log_data["newTab-" + str(i)])

for i in range(tab_history_begin, tab_history_end+1):
    tab_history_list.append(log_data["tabActivated-" + str(i)])

# parse data
# access pattern 1
time_interval = 10 * 60 * 1000
feature_1_cnt = {}
feature_1_tot = {}
prev_k = 0
for k in range(tab_history_begin, tab_history_end+1):
    while tab_history_list[k]["timestamp"] - tab_history_list[prev_k]["timestamp"] > time_interval:
        prev_k = prev_k + 1
    tabUID1 = tab_history_list[k]["tabUID"]
    if (not tabUID1 in feature_1_tot):
        feature_1_tot[tabUID1] = 0
    for k2 in range(prev_k, k):
        tabUID1 = tab_history_list[k]["tabUID"]
        tabUID2 = tab_history_list[k2]["tabUID"]
        if (tabUID1 == tabUID2):
            continue
        feature_1_tot[tabUID1] = feature_1_tot[tabUID1] + 1
        if (tabUID1 > tabUID2):
            tabUID1, tabUID2 = tabUID2, tabUID1
        if (not (tabUID1, tabUID2) in feature_1_cnt):
            feature_1_cnt[(tabUID1, tabUID2)] = 0;
        feature_1_cnt[(tabUID1, tabUID2)] = feature_1_cnt[(tabUID1, tabUID2)] + 1

# access pattern 2

feature_2_cnt = {}
feature_2_tot = {}
prev_k = 0
for k in range(tab_history_begin, tab_history_end+1):
    while tab_history_list[k]["timestamp"] - tab_history_list[prev_k]["timestamp"] > time_interval:
        prev_k = prev_k + 1
    tabUID1 = tab_history_list[k]["tabUID"]
    if (not tabUID1 in feature_2_tot):
        feature_2_tot[tabUID1] = 0
    for k2 in range(prev_k, k):
        tabUID1 = tab_history_list[k]["tabUID"]
        tabUID2 = tab_history_list[k2]["tabUID"]
        if (tabUID1 == tabUID2):
            continue
        feature_2_tot[tabUID1] = feature_2_tot[tabUID1] + tab_history_list[k2+1]["timestamp"] - tab_history_list[k2]["timestamp"]
        if (tabUID1 > tabUID2):
            tabUID1, tabUID2 = tabUID2, tabUID1
        if (not (tabUID1, tabUID2) in feature_2_cnt):
            feature_2_cnt[(tabUID1, tabUID2)] = 0;
        feature_2_cnt[(tabUID1, tabUID2)] = feature_2_cnt[(tabUID1, tabUID2)] + tab_history_list[k2+1]["timestamp"] - tab_history_list[k2]["timestamp"]

# access pattern 3
feature_3_cnt = {}
feature_3_tot = {}
prev_k = 0
for k in range(tab_history_begin, tab_history_end+1):
    while tab_history_list[k]["timestamp"] - tab_history_list[prev_k]["timestamp"] > time_interval:
        prev_k = prev_k + 1
    tabUID1 = tab_history_list[k]["tabUID"]
    if (not tabUID1 in feature_3_tot):
        feature_3_tot[tabUID1] = 0
    for k2 in range(k - 1, prev_k - 1, -1):
        tabUID1 = tab_history_list[k]["tabUID"]
        tabUID2 = tab_history_list[k2]["tabUID"]
        if (tabUID1 == tabUID2):
            continue
        if tab_list[tabUID2]["title"] == "New Tab":
            break
        feature_3_tot[tabUID1] = feature_3_tot[tabUID1] + 1
        if (tabUID1 > tabUID2):
            tabUID1, tabUID2 = tabUID2, tabUID1
        if (not (tabUID1, tabUID2) in feature_3_cnt):
            feature_3_cnt[(tabUID1, tabUID2)] = 0;
        feature_3_cnt[(tabUID1, tabUID2)] = feature_3_cnt[(tabUID1, tabUID2)] + 1

# access pattern 4
feature_4_cnt = {}
feature_4_tot = {}
prev_k = 0
for k in range(tab_history_begin, tab_history_end+1):
    while tab_history_list[k]["timestamp"] - tab_history_list[prev_k]["timestamp"] > time_interval:
        prev_k = prev_k + 1
    tabUID1 = tab_history_list[k]["tabUID"]
    if (not tabUID1 in feature_4_tot):
        feature_4_tot[tabUID1] = 0
    for k2 in range(k - 1, prev_k - 1, -1):
        tabUID1 = tab_history_list[k]["tabUID"]
        tabUID2 = tab_history_list[k2]["tabUID"]
        if (tabUID1 == tabUID2):
            continue
        if tab_list[tabUID2]["title"] == "New Tab":
            break
        feature_4_tot[tabUID1] = feature_4_tot[tabUID1] + tab_history_list[k2+1]["timestamp"] - tab_history_list[k2]["timestamp"]
        if (tabUID1 > tabUID2):
            tabUID1, tabUID2 = tabUID2, tabUID1
        if (not (tabUID1, tabUID2) in feature_4_cnt):
            feature_4_cnt[(tabUID1, tabUID2)] = 0;
        feature_4_cnt[(tabUID1, tabUID2)] = feature_4_cnt[(tabUID1, tabUID2)] + tab_history_list[k2+1]["timestamp"] - tab_history_list[k2]["timestamp"]

# gather access pattern features 
feature_1 = {}
feature_2 = {}
feature_3 = {}
feature_4 = {}
for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        if (i, j) in feature_1_cnt:
            feature_1[(i, j)] = feature_1_cnt[(i, j)] * 1.0 / (feature_1_tot[i] + feature_1_tot[j])
        else:
            feature_1[(i, j)] = 0

for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        if (i, j) in feature_2_cnt:
            feature_2[(i, j)] = feature_2_cnt[(i, j)] * 1.0 / (feature_2_tot[i] + feature_2_tot[j])
        else:
            feature_2[(i, j)] = 0

for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        if (i, j) in feature_3_cnt:
            feature_3[(i, j)] = feature_3_cnt[(i, j)] * 1.0 / (feature_3_tot[i] + feature_3_tot[j])
        else:
            feature_3[(i, j)] = 0

for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        if (i, j) in feature_4_cnt:
            feature_4[(i, j)] = feature_4_cnt[(i, j)] * 1.0 / (feature_4_tot[i] + feature_4_tot[j])
        else:
            feature_4[(i, j)] = 0

# load label
label_file_name = sys.argv[2]
label_file = open(label_file_name, "r")
tab_label = {}
pair_label = {}
cur_line_id = 0
for line in label_file:
    tab_label[cur_line_id] = line
    cur_line_id = cur_line_id + 1

# generate pair label
for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        if tab_label[i] == tab_label[j]:
            pair_label[(i, j)] = 'yes'
        else:
            pair_label[(i, j)] = 'no'

# generate arff file
# header
arff_data = {}
arff_data["attributes"] = [
            ("feature_1", "REAL"),
            ("feature_2", "REAL"),
            ("feature_3", "REAL"),
            ("feature_4", "REAL"),
            ("same_group", ["yes", "no"]),
        ]
arff_data["description"] = "browser tabs belong to same task classification"
arff_data["relation"] = "multitasking"
# fill data
arff_data["data"] = []
for i in range(new_tab_id_begin, new_tab_id_end+1):
    for j in range(i+1, new_tab_id_end+1):
        data_item = [feature_1[(i,j)], feature_2[(i,j)], feature_3[(i,j)], feature_4[(i,j)], pair_label[(i, j)]]
        if data_item == [0, 0, 0, 0, 'no']:
            continue
        arff_data["data"].append(data_item)

print arff.dumps(arff_data)

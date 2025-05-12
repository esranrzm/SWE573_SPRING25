import requests
from flask import request, jsonify
from app import app

def search_entity_id(query):
    url = 'https://www.wikidata.org/w/api.php'
    params = {
        'action': 'wbsearchentities',
        'format': 'json',
        'search': query,
        'language': 'en',
        'limit': 1
    }
    response = requests.get(url, params=params)
    data = response.json()
    if data.get('search'):
        return data['search'][0]['id']
    return None

def get_entity_attributes(entity_id):
    url = 'https://www.wikidata.org/w/api.php'
    params = {
        'action': 'wbgetentities',
        'format': 'json',
        'ids': entity_id,
        'languages': 'en'
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data.get('entities', {}).get(entity_id, {})

def get_property_label(prop_id):
    url = 'https://www.wikidata.org/w/api.php'
    params = {
        'action': 'wbgetentities',
        'format': 'json',
        'ids': prop_id,
        'languages': 'en'
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data['entities'][prop_id]['labels']['en']['value']

def extract_first_claim_value(claim):
    mainsnak = claim.get('mainsnak', {})
    datavalue = mainsnak.get('datavalue', {})
    value = datavalue.get('value')

    if not value:
        return None

    if datavalue.get('type') == 'wikibase-entityid':
        return value.get('id') 
    elif isinstance(value, dict) and 'time' in value:
        return value['time']
    elif isinstance(value, dict) and 'amount' in value:
        return value['amount']
    elif isinstance(value, str):
        return value
    else:
        return str(value)

def prepare_data(query):
    final_result = []
    entity_id = search_entity_id(query)

    if not entity_id:
        #print(f"No entity found for query '{query}'")
        final_result.append("No entity found for query")
        return final_result

    entity_data = get_entity_attributes(entity_id)

    claims = entity_data.get('claims', {})

    max_claims = 25
    count = 0
    for prop_id, claim_list in claims.items():
        if count >= max_claims:
            break

        try:
            label = get_property_label(prop_id)
        except:
            label = prop_id

        first_value_raw = extract_first_claim_value(claim_list[0])

        if isinstance(first_value_raw, str) and first_value_raw.startswith('Q'):
            try:
                value_label = get_property_label(first_value_raw)
            except:
                value_label = first_value_raw
        else:
            value_label = first_value_raw

        final_result.append("- {}:\t{}\n".format(label, value_label))
        #print(f"- {label}: {value_label}")
        count += 1
    return final_result


# Get wikidata response
@app.route("/api/wikidata", methods=["POST"])
def get_wikidata_details():
    data=request.json
    searched_query = data.get("label")
    
    return jsonify({
        "label": searched_query,
        "result": prepare_data(searched_query)
    })
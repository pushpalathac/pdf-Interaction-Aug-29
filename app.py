from flask import Flask, render_template, request, jsonify
import requests
import json
import hashlib

app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')
# Dictionary to store hashes and corresponding docIDs
uploaded_files = {}

def upload_pdf(file_data):
    # Calculate the SHA-256 hash of the file
    file_name=file_data.filename
    sha256_hash = hashlib.sha256()
    for byte_block in iter(lambda: file_data.read(4096), b""):
        sha256_hash.update(byte_block)
    file_hash = sha256_hash.hexdigest()
    
    file_data.seek(0) # Reset file pointer to the beginning

    try:
        with open('uploaded_files.json', 'r') as file:
            uploaded_files = json.load(file)
    except FileNotFoundError:
        uploaded_files = {}

    # Check if the file hash already exists
    if file_hash in uploaded_files:
        print(f"File already uploaded. DocID: {uploaded_files[file_hash][0]}")
        return uploaded_files[file_hash][0]

    # Upload the file if it's new
    headers = {
        'x-api-key': 'ask_ed9368462784b3ebca628eaa9b52bde3'
    }
    file_stream = file_data.stream
    
    response = requests.post('https://api.askyourpdf.com/v1/api/upload', headers=headers,
                             files={'file': (file_data.filename, file_stream)})
   
    if response.status_code == 201:
        docID = response.json().get('docId')
        uploaded_files[file_hash] =  docID, file_name
        with open('uploaded_files.json', 'w') as file:
            json.dump(uploaded_files, file)
        return docID
    else:
        return None

@app.route('/upload', methods=['POST'])
def upload_endpoint():
    file_data = request.files['file']
    print(file_data,"file_data")
    docID = upload_pdf(file_data)
    
    if docID:
        return jsonify({"docID": docID})
    else:
        return jsonify({"error": "Failed to upload file"}), 400


@app.route('/chat/<doc_id>', methods=['POST'])
def chat_endpoint(doc_id):
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'ask_ed9368462784b3ebca628eaa9b52bde3'
    }

    data = request.json # Read the question from the request body

    url = 'https://api.askyourpdf.com/v1/chat/' + doc_id
    response = requests.post(url, headers=headers, data=json.dumps(data))
   
    # response in above giving 200 status and data is the question 

    if response.status_code == 200:
        response_json = response.json()
        
        message = response_json.get('answer', {}).get('message')
        print(message)
    
        return jsonify({'question':data[0].get('message'),
                        'response':message})
    else:
        return jsonify({"error": "Failed to send chat message"}), 400

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port='9000')

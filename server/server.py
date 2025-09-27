from flask import Flask, jsonify

# app instance
app = Flask(__name__)

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Hello world!7"
    })

if __name__ == "__main__":
    app.run(debug=True)
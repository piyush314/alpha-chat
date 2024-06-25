# app.py
from flask import Flask, render_template, request, jsonify, session
import openai

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a real secret key


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/set_api_key', methods=['POST'])
def set_api_key():
    api_key = request.json['api_key']
    session['api_key'] = api_key
    return jsonify({"success": True})


@app.route('/chat', methods=['POST'])
def chat():
    if 'api_key' not in session:
        return jsonify({"error": "API key not set"}), 400

    openai.api_key = session['api_key']
    user_message = request.json['message']
    model = request.json['model']
    temperature = request.json['temperature']

    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[{
                "role": "system",
                "content": "You are a helpful assistant."
            }, {
                "role": "user",
                "content": user_message
            }],
            temperature=temperature)
        return jsonify({"message": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5010)

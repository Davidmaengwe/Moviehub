from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import os

print("🎬 Starting MovieHub Email Service...")

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# --- CONFIGURATION ---
# Use environment variables for security
SENDER_EMAIL = os.getenv("MOVIEHUB_EMAIL", "dmaengwe8@gmail.com")
SENDER_PASSWORD = os.getenv("MOVIEHUB_PASS", "veozsapsvhheniay")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465  # For SSL

class MovieHubEmail:
    def send_welcome_email(self, user_email, user_name):
        try:
            print(f"📧 Sending welcome email to {user_name}...")

            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"MovieHub <{SENDER_EMAIL}>"
            message["To"] = user_email
            message["Subject"] = "Welcome to MovieHub! 🎬"

            # Plain and HTML versions
            text_content = f"""
            Welcome to MovieHub, {user_name}!

            We're excited to have you join our movie community!

            Start exploring movies and build your watchlist today.

            Happy watching!
            - The MovieHub Team
            """
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #e94560; text-align: center;">🎬 Welcome to MovieHub!</h1>
                    <h2>Hello {user_name}! 👋</h2>
                    <p>We're excited to have you join our movie community!</p>
                    <p>Start exploring movies and build your watchlist today.</p>
                    <br>
                    <p><strong>Happy watching! 🍿</strong></p>
                    <p><em>- The MovieHub Team</em></p>
                </div>
            </body>
            </html>
            """

            message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))

            # Secure connection and send
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, user_email, message.as_string())

            print(f"✅ Email successfully sent to {user_email}")
            return True

        except smtplib.SMTPAuthenticationError:
            print("❌ Authentication failed — check Gmail App Password!")
            return False
        except smtplib.SMTPConnectError:
            print("❌ Could not connect to SMTP server — check firewall or internet.")
            return False
        except Exception as e:
            print(f"❌ General email send error: {e}")
            return False


email_service = MovieHubEmail()

@app.route('/signup', methods=['POST', 'OPTIONS'])
def handle_signup():
    if request.method == 'OPTIONS':
        return '', 200

    print("📝 NEW SIGNUP REQUEST!")
    user_data = request.json
    user_name = user_data.get('name')
    user_email = user_data.get('email')

    print(f"   Name: {user_name}")
    print(f"   Email: {user_email}")

    if not user_name or not user_email:
        return jsonify({'error': 'Name and email are required'}), 400

    success = email_service.send_welcome_email(user_email, user_name)
    if success:
        return jsonify({'message': 'Welcome email sent successfully! 🎬'}), 200
    else:
        return jsonify({'error': 'Failed to send email'}), 500


@app.route('/')
def home():
    return "🎬 MovieHub Email Server is Running!"


@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    print("🚀 Server running on http://localhost:5000")
    print("🔓 CORS enabled - website can now connect!")
    app.run(host='0.0.0.0', port=5000, debug=True)

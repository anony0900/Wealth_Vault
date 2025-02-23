import smtplib
from flask import (Flask, jsonify, send_file, render_template, request, redirect, url_for, flash, session)
from flask_cors import CORS
import random
import string
from io import BytesIO
import io
import base64
from pymongo import MongoClient, errors
import qrcode
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from bson import ObjectId


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.secret_key = ""
uri = "mongodb+srv://anony:atlas@cluster0.f18iy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(uri)

db = client["finance"]

collection1 = db["users"]
collection2 = db["money"]
collection3 = db["transactions"]

# Load environment variables
load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# Function to generate random alphanumeric string
def generate_captcha_text(length=6):
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for _ in range(length))


# Function to generate captcha image and return base64 string
def generate_captcha():
    # Generate random text
    captcha_text = generate_captcha_text()

    # Create image
    width, height = 160, 60
    image = Image.new("RGB", (width, height), (255, 255, 255))
    font = ImageFont.truetype("arial.ttf", 40)
    draw = ImageDraw.Draw(image)

    # Add text to image
    text_width = draw.textlength(captcha_text, font=font)
    text_height = 40
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), captcha_text, font=font, fill=(0, 0, 0))

    # Add noise (dots)
    for _ in range(2500):
        x = random.randint(0, width)
        y = random.randint(0, height)
        draw.point(
            (x, y),
            fill=(
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
            ),
        )

    # Convert image to base64
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return {"image": img_str, "text": captcha_text}


otp_store = {}

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(receiver_email):
    """Send OTP via email and return the generated OTP"""
    otp = generate_otp()
    
    # Email content
    subject = "SkyWay Airlines - Your OTP Code"
    body = f"""
    Dear User,
    
    Your OTP code for SkyWay Airlines verification is: {otp}
    
    This code is valid for 5 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    SkyWay Airlines Team
    """

    # Create email
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, receiver_email, msg.as_string())
        server.quit()
        
        # Store OTP with timestamp and email
        otp_store[receiver_email] = {
            'otp': otp,
            'timestamp': datetime.now(),
            'attempts': 0
        }
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    

def update_money_collection(email=None):
    """
    Update money collection with aggregated transaction data.
    If email is provided, update only for that user.
    """
    try:
        # Base pipeline
        match_stage = {} if email is None else {"$match": {"email": email}}
        
        pipeline = [
            match_stage,
            {
                "$group": {
                    "_id": "$email",
                    "totalIncome": {"$sum": {"$cond": [{"$eq": ["$type", "income"]}, "$amount", 0]}},
                    "totalExpense": {"$sum": {"$cond": [{"$eq": ["$type", "expense"]}, "$amount", 0]}},
                }
            },
            {
                "$project": {
                    "email": "$_id",
                    "totalBalance": {"$subtract": ["$totalIncome", "$totalExpense"]},
                    "income": "$totalIncome",
                    "expense": "$totalExpense",
                    "_id": 0
                }
            }
        ]

        # Remove empty match stage if no email provided
        if not match_stage:
            pipeline.pop(0)

        results = list(collection3.aggregate(pipeline))  # Use your existing collection3 (transactions)

        if email:
            # If no transactions found for the email, set all values to 0
            if not results:
                collection2.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "totalBalance": 0,
                            "income": 0,
                            "expense": 0,
                            "updatedAt": datetime.now()
                        }
                    },
                    upsert=True
                )
            else:
                # Update with aggregated results
                for record in results:
                    collection2.update_one(
                        {"email": record["email"]},
                        {
                            "$set": {
                                "totalBalance": record["totalBalance"],
                                "income": record["income"],
                                "expense": record["expense"],
                                "updatedAt": datetime.now()
                            }
                        },
                        upsert=True
                    )
        return True
    except Exception as e:
        print(f"Error updating money collection: {e}")
        return False

# Add these new routes to your Flask application
@app.route("/api/get-captcha", methods=["GET"])
def get_captcha():
    captcha_data = generate_captcha()
    return jsonify(
        {"captcha_image": captcha_data["image"], "captcha_text": captcha_data["text"]}
    )


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    user_captcha = data["captcha"]

    if not user_captcha:
        return jsonify({"message": "Invalid captcha"}), 400
    try:
        user = collection1.find_one({"email": email, "password": password})

        if user:
            return jsonify(
                {"message": "User logged in successfully", "token:": "asdf1245bm"}
            )
        else:
            return jsonify({"message": "User login failed"})

    except errors.ConnectionFailure:
        return "Error: Unable to connect to the database."


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data["name"]
    email = data["email"]
    password = data["password"]
    mobile = data["mobile"]
    user_captcha = data["captcha"]

    # Verify captcha
    if not user_captcha:
        return jsonify({"message": "Invalid captcha"}), 400

    try:
        collection1.insert_one(
            {"name": name, "email": email, "password": password, "mobile": mobile, "createdAt:": datetime.now()}
        )
        return jsonify(
            {"message": "User registered successfully", "token:": "asdf1245bm"}
        )

    except errors.ConnectionFailure:
        return "Error: Unable to connect to the database."


@app.route("/api/create-otp", methods=["POST"])
def create_otp():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        # Check if user exists in database
        user = collection1.find_one({"email": email}, {"_id": 0})
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # Check if there's an existing OTP and it's not too recent
        if email in otp_store:
            time_diff = datetime.now() - otp_store[email]["timestamp"]
            if (
                time_diff.total_seconds() < 60
            ):  # Minimum 1 minute between resend attempts
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Please wait 3 minute before requesting a new OTP",
                            "wait_time": 180 - int(time_diff.total_seconds()),
                        }
                    ),
                    429,
                )

        # Send new OTP
        if send_otp_email(email):
            return (
                jsonify({"status": "success", "message": "OTP sent successfully"}),
                200,
            )
        else:
            return jsonify({"status": "error", "message": "Failed to send OTP"}), 500

    except Exception as e:
        print(f"Error in resend_otp: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()
        email = data.get("email")
        user_otp = data.get("otp")

        if not email or not user_otp:
            return (
                jsonify({"status": "error", "message": "Email and OTP are required"}),
                400,
            )

        # Check if OTP exists and is valid
        if email not in otp_store:
            return (
                jsonify({"status": "error", "message": "No OTP found for this email"}),
                404,
            )

        stored_otp_data = otp_store[email]
        time_diff = datetime.now() - stored_otp_data["timestamp"]

        # Check if OTP is expired (5 minutes)
        if time_diff.total_seconds() > 300:
            del otp_store[email]
            return jsonify({"status": "error", "message": "OTP has expired"}), 400

        # Check if max attempts exceeded
        if stored_otp_data["attempts"] >= 3:
            del otp_store[email]
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Maximum verification attempts exceeded",
                    }
                ),
                400,
            )

        # Verify OTP
        if stored_otp_data["otp"] == user_otp:
            del otp_store[email]  # Clear OTP after successful verification
            return (
                jsonify({"status": "success", "message": "OTP verified successfully"}),
                200,
            )
        else:
            # Increment failed attempts
            stored_otp_data["attempts"] += 1
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Invalid OTP",
                        "attempts_left": 3 - stored_otp_data["attempts"],
                    }
                ),
                400,
            )

    except Exception as e:
        print(f"Error in verify_otp: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@app.route('/api/profile', methods=['POST'])
def get_profile():
    try:
        data = request.get_json()
        email = data.get('email') if data else None

        if not email:
            return jsonify({
                "message": "Email is required",
                "status": "error"
            }), 400

        # Find user in collection1
        user = collection1.find_one({'email': email},{"_id": 0})
        
        print("User:", user)
        if not user:
            return jsonify({
                "message": "User not found",
                "status": "error"
            }), 404

        # user.pop('password', None)
        
        return jsonify({
            "status": "success",
            "data": user
        }), 200

    except errors.ConnectionFailure:
        return jsonify({
            "message": "Database connection error",
            "status": "error"
        }), 500
    except Exception as e:
        return jsonify({
            "message": f"An error occurred: {str(e)}",
            "status": "error"
        }), 500


@app.route("/api/transactions", methods=["POST"])
def create_transaction():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["email", "type", "category", "amount", "description", "date"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Create transaction document
        transaction = {
            "email": data["email"],
            "type": data["type"],  # "income" or "expense"
            "category": data["category"],
            "amount": float(data["amount"]),
            "description": data["description"],
            "date": data["date"],
            "createdAt": datetime.now()
        }

        # Insert into collection3 (transactions)
        result = collection3.insert_one(transaction)

        if result.inserted_id:
            # Update money collection
            update_money_collection(data["email"])

            return jsonify({
                "status": "success",
                "message": "Transaction created successfully",
                "transaction_id": str(result.inserted_id)
            }), 201
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to create transaction"
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route("/api/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["type", "category", "amount", "description", "date"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Create update document
        update_data = {
            "type": data["type"],
            "category": data["category"],
            "amount": float(data["amount"]),
            "description": data["description"],
            "date": data["date"],
            "updatedAt": datetime.now()
        }

        # Update in collection3
        result = collection3.update_one(
            {"_id": ObjectId(transaction_id)},
            {"$set": update_data}
        )

        if result.modified_count > 0:
            # Update money collection
            update_money_collection(data["email"])
            return jsonify({
                "status": "success",
                "message": "Transaction updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Transaction not found or no changes made"
            }), 404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        email = request.args.get("email")
        
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email parameter is required"
            }), 400

        # Find all transactions for the user
        transactions = list(collection3.find(
            {"email": email},
            {"_id": 1, "type": 1, "category": 1, "amount": 1, "description": 1, "date": 1}
        ))

        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            transaction["id"] = str(transaction["_id"])  # Add id field
            del transaction["_id"]  # Remove _id field

        return jsonify(transactions), 200  # Return just the array

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500


@app.route("/api/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    try:
        # First get the transaction to know the email
        transaction = collection3.find_one({"_id": ObjectId(transaction_id)})
        if not transaction:
            return jsonify({
                "status": "error",
                "message": "Transaction not found"
            }), 404

        email = transaction["email"]
        
        # Delete the transaction
        result = collection3.delete_one({"_id": ObjectId(transaction_id)})

        if result.deleted_count > 0:
            # Update money collection
            update_money_collection(email)
            
            return jsonify({
                "status": "success",
                "message": "Transaction deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Transaction not found"
            }), 404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500
    

@app.route("/api/balance", methods=["POST"])
def get_balance():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({
                "message": "Email is required",
                "status": "error"
            }), 400

        # Find user's balance details in collection2
        balance_info = collection2.find_one(
            {"email": email},
            {"_id": 0, "totalBalance": 1, "income": 1, "expense": 1}
        )

        if not balance_info:
            return jsonify({
                "message": "Balance information not found",
                "status": "error"
            }), 404

        return jsonify({
            "status": "success",
            "data": balance_info
        }), 200

    except errors.ConnectionFailure:
        return jsonify({
            "message": "Database connection error",
            "status": "error"
        }), 500



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

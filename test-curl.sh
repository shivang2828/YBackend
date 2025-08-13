#!/bin/bash

# Test the /test endpoint first
echo "Testing /test endpoint..."
curl -X POST \
  -F "fullname=Shivang" \
  -F "email=shivang@gmail.com" \
  -F "password=123456" \
  -F "username=ffuguggfw" \
  -F "avatar=@test-image.jpg" \
  -F "coverimage=@test-image2.jpg" \
  http://localhost:8000/api/v1/users/test

echo -e "\n\nTesting /register endpoint..."
curl -X POST \
  -F "fullname=Shivang" \
  -F "email=shivang@gmail.com" \
  -F "password=123456" \
  -F "username=ffuguggfw" \
  -F "avatar=@test-image.jpg" \
  -F "coverimage=@test-image2.jpg" \
  http://localhost:8000/api/v1/users/register

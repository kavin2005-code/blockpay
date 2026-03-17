import urllib.request, json, urllib.error

login_data = json.dumps({"identifier": "test@test.com", "password": "Test@1234"}).encode()
login_req = urllib.request.Request("http://localhost:5000/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/json"})
login_res = urllib.request.urlopen(login_req)
token = json.loads(login_res.read())["data"]["tokens"]["accessToken"]
print("Token:", token)

try:
    deposit_data = json.dumps({"amount": 5000, "method": "UPI"}).encode()
    deposit_req = urllib.request.Request("http://localhost:5000/api/v1/transactions/wallet/deposit", data=deposit_data, headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    deposit_res = urllib.request.urlopen(deposit_req)
    print("Deposit:", json.loads(deposit_res.read()))
except urllib.error.HTTPError as e:
    print("Error status:", e.code)
    print("Error body:", e.read().decode())

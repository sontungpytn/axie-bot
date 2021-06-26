# AXIE BUY BOT

---
## Setup
### Install node_modules
```bash
npm i
```

### Copy `.env.example` to `.env` and update variables

### Start server
```bash
npm run start
```


---

## API Endpoint

#### 1. Cho phép chợ sử dụng WETH của ví (không trừ tiền, có tính phí gas)

Có thể cho phép bao nhiêu cũng được, không cần nhỏ hơn hoặc bằng tiền trong ví

method: POST

path: /approve

body

```json
{
  "value": "0.5"
}

```
Cho phép sử dụng 0.5 WETH

#### 2. Xem số ETH đã được cho phép

method: GET

path: /allowance


#### 3. Mua axie theo ID

method: POST
   
path: /buy

body

```json
{
  "id":"75176"
}
```

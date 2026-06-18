# LinkZip Developer API (v1) - Technical Documentation & Integration Guide

Welcome to the LinkZip Developer API. This document explains how to authenticate, request short links, classify them by category, and handle responses.

This guide is optimized to be read by humans and AI Chatbots (such as ChatGPT, Claude, and Antigravity) to automate integration inside WordPress blogs, custom CMS, or automation platforms (like Make/Zapier).

---

## 1. Authentication

All requests to the LinkZip API must be authenticated using a **Bearer Token** sent in the `Authorization` HTTP header.

### How to get your API Key:
1. Log in to your **LinkZip** dashboard.
2. Go to **Settings** (`/dashboard/settings`).
3. Scroll to the **Developer API Keys** section (Note: Requires a **Pro** plan).
4. Enter a name for your key (e.g., "WordPress Blog") and click **Generate New Key**.
5. Copy the generated key (`lz_live_...`) immediately. *For security reasons, it will never be displayed again.*

### Header Format:
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

---

## 2. API Endpoint: Create a Shortened Link

*   **Endpoint URL:** `https://linkzip.uk/api/v1/links`
*   **HTTP Method:** `POST`
*   **Request Format:** `JSON`

### Request Body Parameters:

| Parameter | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| **`longUrl`** | `string` | **Yes** | The destination URL to shorten. Must include `http://` or `https://`. |
| **`title`** | `string` | No | A custom descriptive name for the link in your dashboard (max 80 chars). |
| **`category`** | `string` | No | A category to classify the link (max 30 chars). If the category does not exist for your account, **it will be created automatically on the fly**. |
| **`customSlug`** | `string` | No *(Pro Only)* | A custom alias (e.g. `summersale`). 3-30 chars, only alphanumeric, dashes `-`, and underscores `_`. |
| **`password`** | `string` | No *(Pro Only)* | Password to protect the redirection page. |
| **`expiresInDays`** | `integer` | No *(Pro Only)* | Expire link after $N$ days (between 1 and 365). |

---

## 3. Responses

### Success Response (`201 Created`)
Returned when the short link is successfully generated.

```json
{
  "shortcode": "l7vv3",
  "shortUrl": "https://linkzip.uk/l7vv3",
  "targetUrl": "https://github.com",
  "title": "GitHub Home",
  "category": "Desarrollo",
  "expiresAt": null
}
```

### Error Responses

#### `400 Bad Request`
Returned if input validation fails (e.g., malformed URL, invalid custom slug format).
```json
{
  "error": "Invalid URL structure. Make sure it includes http:// or https://"
}
```

#### `401 Unauthorized`
Returned if the `Authorization` header is missing, malformed, or the API key has been revoked.
```json
{
  "error": "Invalid or revoked API key."
}
```

#### `403 Forbidden`
Returned if you try to use Pro features (custom slug, password, expiration) on a Free plan, or if your account exceeds monthly creation limits.
```json
{
  "error": "Advanced features (Custom slugs, passwords, expiration) require a Pro plan."
}
```

#### `429 Too Many Requests`
Returned if you exceed the rate limits.
```json
{
  "error": "Too many link creation requests. Rate limit exceeded."
}
```

---

## 4. Rate Limits & Account Constraints

*   **PRO Users:**
    *   **Rate Limit:** 60 link creations per minute.
    *   **Keys Limit:** Up to 5 active API keys.
*   **FREE Users:**
    *   Developer API Key generation is locked. Upgrade to Pro is required.

---

## 5. Integration Code Snippets

### cURL (Command Line)
```bash
curl -X POST https://linkzip.uk/api/v1/links \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://github.com",
    "title": "GitHub Home",
    "category": "Desarrollo"
  }'
```

### JavaScript / Node.js
```javascript
const shortenLink = async (longUrl, title, category) => {
  const response = await fetch('https://linkzip.uk/api/v1/links', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ longUrl, title, category })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to shorten link');
  }
  return data.shortUrl; // e.g. "https://linkzip.uk/l7vv3"
};
```

### Python
```python
import requests

def shorten_link(long_url, title=None, category=None):
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "longUrl": long_url,
        "title": title,
        "category": category
    }
    response = requests.post("https://linkzip.uk/api/v1/links", json=payload, headers=headers)
    
    if response.status_code == 201:
        return response.json()["shortUrl"]
    else:
        raise Exception(response.json().get("error", "Error creating link"))
```

### WordPress / PHP (Auto-mask links in posts)
```php
function linkzip_shorten_url($long_url, $title = '', $category = 'Blog') {
    $api_key = 'YOUR_API_KEY';
    $api_url = 'https://linkzip.uk/api/v1/links';
    
    $body = array(
        'longUrl'  => $long_url,
        'title'    => $title,
        'category' => $category
    );
    
    $args = array(
        'body'        => json_encode($body),
        'headers'     => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ),
        'timeout'     => 15,
        'method'      => 'POST',
        'data_format' => 'body',
    );
    
    $response = wp_remote_post($api_url, $args);
    
    if (is_wp_error($response)) {
        return $long_url; // Fail-safe: return original URL
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = json_decode(wp_remote_retrieve_body($response), true);
    
    if ($response_code === 201 && isset($response_body['shortUrl'])) {
        return $response_body['shortUrl'];
    }
    
    return $long_url;
}
```

import requests


def wikipedia_search(query: str, limit: int = 5) -> list[dict]:
    response = requests.get(
        "https://en.wikipedia.org/w/api.php",
        params={"action": "opensearch", "search": query, "limit": limit, "namespace": 0, "format": "json"},
        timeout=10,
        headers={"User-Agent": "AURA/2.0"},
    )
    response.raise_for_status()
    data = response.json()
    return [{"title": title, "url": url, "snippet": snippet} for title, snippet, url in zip(data[1], data[2], data[3])]

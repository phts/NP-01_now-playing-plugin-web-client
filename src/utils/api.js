export async function requestPluginApiEndpoint(apiPath, endpoint, payload, method = 'GET') {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  switch(method.toUpperCase()) {
    case 'GET': {
      const qs = payload ? '?' + (new URLSearchParams(payload)).toString() : '';
      const url = `${apiPath}${endpoint}${qs}`;
      const res = await fetch(url, {
        method: 'GET',
        headers
      });
      return res.json();
    }
    case 'POST': {
      const url = `${apiPath}${endpoint}`;
      const fetchParams = {
        method: 'POST',
        headers
      };
      if (payload) {
        fetchParams.body = JSON.stringify(payload);
      }
      const res = await fetch(url, fetchParams);
      return res.json();
    }
    default:
      return null;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      netlify: process.env.NETLIFY,
      event: {
        httpMethod: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters
      }
    })
  };
};
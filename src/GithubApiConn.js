import http from 'https';

const GITHUB_API_URL = 'api.github.com';

// params: C# language, sorted from oldest, first 5 ones
const pathParams = '/orgs/takenet/repos?language=c%23&sort=created_at&direction=asc&per_page=5';

const options = {
    hostname: GITHUB_API_URL,
    path: pathParams,
    method: 'GET',
    headers: {
        'User-Agent': 'caroolpmelo',
        'Accept': 'application/vnd.github.v3+json'
    }
};

// stores github API response for access in other file
export let ResponseData = [];

// makes the GET request to the API
export const GithubResponse = () => {
    let responseDataStr = '';
    
    // passing query params defined above
    const req = http.request(options, (res) => {
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => {
            // the response chunk is received as string
            responseDataStr += chunk;
        });
        
        res.on('end', () => {
            // after fetching all the chunks, pass data to json for manipulation
            ResponseData = JSON.parse(responseDataStr);
        });
    });
    
    req.end(); // ends connection
}

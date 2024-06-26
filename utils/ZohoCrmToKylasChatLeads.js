const axios = require("axios");

async function fetchAccessToken() {
    const accessTokenUrl = process.env.ACCESS_TOKEN_URL;

    try {
        const response = await axios.get(accessTokenUrl);
        return response.data.trim();
    } catch (error) {
        console.log("Error fetching access token:", error);
        throw error;
    }
}

async function fetchAllLeadData(accessToken) {
    try {
        const token =
            accessToken;
        const url = "https://www.zohoapis.in/crm/v2/Leads/search?criteria=(Lead_Source:equals:Chat)";
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
        };

        const response = await axios.get(url, { headers });

        const leads = response.data.data.filter((lead) => {
            const createdTime = new Date(lead.Created_Time).getTime();
            const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
            return createdTime >= thirtyMinutesAgo;
        });

        console.log("Lead data created in the last 30 minutes in Chat:", leads);
        return leads;
    } catch (error) {
        console.error("Error fetching lead data in Chat:", error.message);
        return [];
    }
}

function mapZohoLeadToKylasFormat(lead) {
    return {
        "firstName": lead.First_Name == null ? "" : `${lead.First_Name}` ?? "",
        "lastName": `${lead.Last_Name}` ?? "",
        "phoneNumbers": [
            {
                "type": "MOBILE",
                "code": "IN",
                "value": `${lead.Phone}` ?? "",
                "primary": true
            }
        ],
        "city": `${lead.City}` ?? "",
        "state": `${lead.State}` ?? "",
        "source": 81564,
        "subSource": "Sales IQ"
    };
}

async function postLeadToKylas(lead) {
    try {
        const postData = mapZohoLeadToKylasFormat(lead);
        console.log(postData);
        const url = 'https://api.kylas.io/v1/leads';
        const headers = {
            'api-key': '1e8d51e4-de78-4394-b5a9-e9d10b1e72d2'
        };

        const response = await axios.post(url,
            postData
            , { headers });

        console.log('Lead posted to Kylas:', response.data);
    } catch (error) {
        console.error('Error posting lead to Kylas:', error.message);
    }
}

async function ZohoCRMToKylasChatLeads() {
    const accessToken = await fetchAccessToken();
    const leadsData = await fetchAllLeadData(accessToken);

    for (const lead of leadsData) {
        await postLeadToKylas(lead);
    }
}

module.exports = {
    ZohoCRMToKylasChatLeads
}
const axios = require('axios');

const postLead = async (leadData) => {
    const config = {
        method: 'post',
        url: 'https://www.zohoapis.in/crm/v2/Leads',
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(leadData)
    };

    try {
        return await axios(config);
    } catch (error) {
        console.log('Error in postLead function:', error);
        throw error;
    }
}

exports.postLeadToZohoCRM = async (lead) => {
    console.log("lead number");
    console.log(lead.entity.phoneNumbers[0].value);
    try {
        const leadData = {
            data: [
                {
                    First_Name: lead.entity.firstName || "",
                    Last_Name: lead.entity.lastName || "",
                    Phone: (lead.entity.phoneNumbers[0].dialCode + lead.entity.phoneNumbers[0].value) || "",
                
                    City: lead.entity.city || "",
                    State: lead.entity.state || "",
                    Zip_Code: lead.entity.zipcode || "",
                    Lead_Source: lead.entity.source.value || "",
                    Kylas_Owner: lead.entity.ownerId.value || "",
                    Lead_Status: "Open",
                    Kylas_Lead_Id: lead.entity.id.toString(),
                },
            ],
        };

        const response = await postLead(leadData);
        console.log('Lead posted to Zoho CRM successfully:', response.data);
    } catch (error) {
        console.log('Error posting lead to Zoho CRM:', error.response ? error.response.data : error);
    }
}

// Update Leads
const updateLead = async (leadData, leadId) => {
    const config = {
        method: 'put',
        url: `https://www.zohoapis.in/crm/v2/Leads/${leadId}`,
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(leadData)
    };

    try {
        return await axios(config);
    } catch (error) {
        console.log('Error in postLead function:', error);
        return null;
    }
}

const getLeadIdByPhoneNumber = async (phoneNumber) => {
    const apiUrl = `https://www.zohoapis.in/crm/v2/Leads/search?criteria=(Phone:equals:${phoneNumber})`;

    const config = {
        method: 'get',
        url: apiUrl,
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0].id;
        }
        else {
            console.log('Entity not found ');
            const leadId = await createLead(phoneNumber);
                return leadId;
                // return null;
        }
    } catch (error) {
        console.log('Error in getLeadIdByPhoneNumber function:', error);
        console.log('Lead Phone Not Found:', phoneNumber);
        return null;
    }
};


const createLead = async (phoneNumber) => {
    const leadData = {
        data: [
            {
                "Phone": phoneNumber,
                "Last_Name": "Update"
            }
        ]
    };

    const config = {
        method: 'post',
        url: 'https://www.zohoapis.in/crm/v2/Leads',
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(leadData)
    };

    try {
        const response = await axios(config);
        if (response.data.data.length > 0) {
            // console.log(`Contact created : ${response.data.data[0].id}`)
            return response.data.data[0].id;
        } else {
            console.log('Failed to create lead.');
            return null;
        }
    } catch (error) {
        console.log('Error creating lead:', error.message);
        return null;
    }
};



exports.updateLeadToZohoCRM = async (lead) => {
    let phoneData = lead.entity.phoneNumbers[0].dialCode + lead.entity.phoneNumbers[0].value;
    console.log("phone number");
    console.log(phoneData);
    console.log(lead);
        console.log(`Identification ${lead.entity.customFieldValues.cfLeadCategory}`);
    console.log(`Identification json: ${JSON.stringify(lead.entity.customFieldValues.cfLeadCategory)}`);
    console.log(`Lead Status json: ${JSON.stringify(lead.entity.pipelineStage)}`);
    console.log(`Lead_Source json: ${JSON.stringify(lead.entity.source)}`);

    const leadId = await getLeadIdByPhoneNumber(phoneData);
    if (leadId == null) {
        console.log('Lead is not updated to Zoho CRM');
        //await exports.postLeadToZohoCRM(lead);
    } else {
        console.log("leadId");
        console.log(leadId);

        try {
            const leadData = {
                data: [
                    {
                        First_Name: lead.entity.firstName || "",
                        Last_Name: lead.entity.lastName || "",
                        Phone: (lead.entity.phoneNumbers[0].dialCode + lead.entity.phoneNumbers[0].value) || "",
                        Street: lead.entity.address || "",
                        City: lead.entity.city || "",
                        State: lead.entity.state || "",
                        Zip_Code: lead.entity.zipcode || "",
                        Lead_Source: lead.entity.source.value || "",
                        Kylas_Owner: lead.entity.ownerId.value || "",
                        Lead_Status: lead.entity.pipelineStage.value || "",
                        Acres_of_Land_if_Farmer: lead.entity.customFieldValues.cfAcresOfLandIfFarmer || "",
                        Details_Updated: true,
                    }
                ],
            };

            const response = await updateLead(leadData, leadId);
            console.log('Lead updated to Zoho CRM successfully:', response.data);
        } catch (error) {
            console.log('Error updating lead to Zoho CRM:', error.response ? error.response.data : error);
        }

    }
}


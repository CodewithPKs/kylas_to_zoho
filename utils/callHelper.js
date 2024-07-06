const axios = require('axios');

const getWhoIdByPhonenumber = async (phoneNumber, entityType, entityName) => {
    let apiUrl = '';

    if (entityType === 'lead') {
        apiUrl = `https://www.zohoapis.in/crm/v2/Leads/search?phone=${phoneNumber}`;
    } else if (entityType === 'contact') {
        apiUrl = `https://www.zohoapis.in/crm/v2/Contacts/search?phone=${phoneNumber}`;
    } else {
        console.log('Invalid entity type:', entityType);
        return null;
    }

    try {
        const config = {
            method: 'get',
            url: apiUrl,
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const response = await axios(config);
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0].id;
        } else {
            console.log('Entity not found ');
            console.log(`${entityType} with phone number ${phoneNumber} not found.`);
            if (entityType === 'lead') {
                return await createLead(phoneNumber, entityName);
            } else if (entityType === 'contact') {
                return await createContact(phoneNumber, entityName);
            }
        }
    } catch (error) {
        console.log(`Error while searching in ${entityType}:`, error.message);
        return null;
    }
};

const createLead = async (phoneNumber, entityName) => {
    const leadData = {
        data: [
            {
                "Phone": phoneNumber,
                "Last_Name": entityName
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

const createContact = async (phoneNumber) => {
    const contactData = {
        data: [
            {
                "Phone": phoneNumber,
                "Last_Name": entityName 
            }
        ]
    };

    const config = {
        method: 'post',
        url: 'https://www.zohoapis.in/crm/v2/Contacts',
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(contactData)
    };

    try {
        const response = await axios(config);
        if (response.data.data.length > 0) {
            print(`Contact created : ${response.data.data[0].id}`)
            return response.data.data[0].id;
        } else {
            console.log('Failed to create contact.');
            return null;
        }
    } catch (error) {
        console.log('Error creating contact:', error.message);
        return null;
    }
};

const PostCall = async (Calldata) => {
    const config = {
        method: 'post',
        url: 'https://www.zohoapis.in/crm/v2/Calls',
        headers: {
            'Authorization': `Zoho-oauthtoken ${ZOHO_CRM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(Calldata)
    };

    try {
        return await axios(config);
    } catch (error) {
        console.log('Error in postCall function:', error);
        throw error;
    }
};

exports.PostCallzoho = async (call) => {
    console.log("Call Data ");
    console.log(call);

    const relatedTo = call.entity.relatedTo;

    const startTime = new Date(call.entity.startTime);
    const offsetMinutes = startTime.getTimezoneOffset();
    const offsetHours = Math.abs(offsetMinutes / 60);
    const offsetSign = offsetMinutes < 0 ? '+' : '-';

    const formattedStartTime = `${startTime.getFullYear()}-${(startTime.getMonth() + 1).toString().padStart(2, '0')}-${startTime.getDate().toString().padStart(2, '0')}T${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}:00${offsetSign}${offsetHours.toString().padStart(2, '0')}:${Math.abs(offsetMinutes % 60).toString().padStart(2, '0')}`;
    console.log(formattedStartTime);
    console.log(call.entity.relatedTo);

    const relatedEntity = call.entity.relatedTo[0];
    const entityType = relatedEntity.entity;
    const entityName = relatedEntity.name;
    console.log(`entity name : ${entityName}`);
    const whoId = await getWhoIdByPhonenumber(call.entity.phoneNumber, entityType , entityName);

    let callType = "";
    if (call.entity.callType == "outgoing") {
        callType = "Outbound";
    } else if (call.entity.callType == "incoming") {
        callType = "Inbound";
    }
    try {
        let Calldata = {
            data: [
                {

                    "Subject": "Kylas Call Info",
                    "Call_Duration": call.entity.duration !== null ? call.entity.duration.toString() : "",
                    "Description": call.entity.callRecording != null ? call.entity.callRecording.url : "",
                    "Call_Start_Time": formattedStartTime || "",
                    "Call_Type": callType || "",
                    "Phone_Number": call.entity.phoneNumber || "",
                    "Call_Status": call.entity.outcome || "",
                    "Outcome": call.entity.outcome || "",
                    "kylas_call_Owner": call.entity.owner.name || "",
                }
            ],
        };

        if (entityType === 'lead') {
            Calldata.data[0]["What_Id"] = {
                "id": whoId
            };
            Calldata.data[0]["$se_module"] = "Leads";
        } else if (entityType === 'contact') {
            Calldata.data[0]["Who_Id"] = {
                "name": relatedEntity.name || "",
                "id": whoId,
            };
        }

        console.log("Calldata");
        console.log(Calldata);
        console.log(relatedEntity.name || "");
        console.log(whoId);
        const response = await PostCall(Calldata);
        console.log('Call posted to Zoho CRM successfully:', response.data);
    } catch (error) {
        console.log('Error posting Call to Zoho CRM:', error.response ? error.response.data : error);
    }
};

'use strict';


/**
 * Creates request Object based on the type of request and form of request if it is from Contact us or HearingTest
 * @param {Object} contactInfo - Object with values filled from different forms
 * @returns {Object} Request body with all needed details
 */
function createRequestBody(contactInfo) {
    var preferences = require('*/cartridge/config/preferences.js');
    var Resource = require('dw/web/Resource');

    var requestBody = {
        lastName: contactInfo.lastName,
        firstName: contactInfo.firstName,
        phone: contactInfo.phone,
        email: contactInfo.email,
        isAuthenticated: contactInfo.isAuthenticated,
        appID: session.custom.appID || preferences.defaultAppID,
        LeadSource: preferences.leadSource
    };
    if (contactInfo.isAuthenticated && contactInfo.sfcccontactId && contactInfo.sfcccontactId !== null) {
        requestBody.sfcccontactId = contactInfo.sfcccontactId;
    }

    if (contactInfo.form === 'contact') {
        requestBody.recordType = Resource.msg('hearing.test.contact', 'easehelpers', null);
        if (contactInfo.dob) {
            requestBody.dob = contactInfo.dob;
        }
        requestBody.street = contactInfo.street;
        requestBody.state = contactInfo.state;
        requestBody.city = contactInfo.city;
        requestBody.zipCode = contactInfo.zipCode;
        requestBody.reasonForInquiry = contactInfo.reasonForInquiry;
        requestBody.commentsContacUs = contactInfo.commentsContacUs;
        requestBody.createdBy = preferences.createdBy || Resource.msg('hearing.test.integration.user', 'easehelpers', null);
    } else if (contactInfo.form === 'hearing') {
        requestBody.brandingID = preferences.brandingID || Resource.msg('hearing.test.uhch', 'easehelpers', null);
        requestBody.status = Resource.msg('hearing.test.in.progress', 'easehelpers', null);
        if (contactInfo.type === 'update') {
            requestBody.resultId = contactInfo.resultId;
            requestBody.updatedBy = preferences.updatedBy || 'Ecom';
        } else {
            requestBody.createdBy = preferences.createdBy || Resource.msg('hearing.test.integration.user', 'easehelpers', null);
        }
        requestBody.questAnswer1 = contactInfo.questAnswer1;
        requestBody.questAnswer2 = contactInfo.questAnswer2;
        requestBody.questAnswer3 = '';
        requestBody.questAnswer4 = {
            option1: contactInfo.questAnswer3.option1 === 'true',
            option2: contactInfo.questAnswer3.option2 === 'true',
            option3: contactInfo.questAnswer3.option3 === 'true',
            option4: contactInfo.questAnswer3.option4 === 'true',
            option5: false
        };
    } else if (contactInfo.form === 'upload') {
        if (contactInfo.dob) {
            requestBody.dob = contactInfo.dob;
        }
        requestBody.street = contactInfo.street;
        requestBody.state = contactInfo.state;
        requestBody.city = contactInfo.city;
        requestBody.zipCode = contactInfo.zipCode;
        requestBody.updatedBy = preferences.updatedBy || 'Ecom';
        requestBody.recordType = contactInfo.isAuthenticated ? Resource.msg('hearing.test.online.upload.authenticated', 'easehelpers', null) : Resource.msg('hearing.test.online.upload.guest', 'easehelpers', null);
        requestBody.healthPlanInsurer = contactInfo.healthPlanInsurer;
        requestBody.healthPlanMemberID = contactInfo.healthPlanMemberID;
        requestBody.earmolduser = contactInfo.earMoldUser;
        requestBody.previoushearingaiduser = contactInfo.previoushearingUser;
        requestBody.docData = {
            documentName: contactInfo.documentName,
            documentType: Resource.msg('hearing.test.medical.records', 'easehelpers', null),
            documentByte: contactInfo.fileBody,
            fileType: contactInfo.fileType
        };
    } else if (contactInfo.form === 'appointment') {
        if (contactInfo.dob) {
            requestBody.dob = contactInfo.dob;
        }
        requestBody.street = contactInfo.street;
        requestBody.state = contactInfo.state;
        requestBody.city = contactInfo.city;
        requestBody.zipCode = contactInfo.zipCode;
        requestBody.updatedBy = preferences.updatedBy || 'Ecom';
        requestBody.healthPlanInsurer = contactInfo.healthPlanInsurer;
        requestBody.healthPlanMemberID = contactInfo.healthPlanMemberId;
        requestBody.OtherInsurer = contactInfo.otherInsurer;
        requestBody.visittype = contactInfo.visittype;
        requestBody.practiceId = contactInfo.practiceId;
        requestBody.recordType = 'appointment';
        requestBody.AARPMemberId = contactInfo.AARPMemberId;
        requestBody.hearingTestQuestion = contactInfo.hearingTestQuestion;
        if(contactInfo.fileBody && contactInfo.fileType && contactInfo.documentName) {
            requestBody.docData = {
                documentName: contactInfo.documentName,
                documentType: Resource.msg('hearing.test.medical.records', 'easehelpers', null),
                documentByte: contactInfo.fileBody,
                fileType: contactInfo.fileType
            };
        }
        
    }
    return requestBody;
}

module.exports = {
    createRequestBody: createRequestBody
};

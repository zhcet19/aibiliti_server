require('dotenv').config()
const express = require('express');
const { google } = require("googleapis");


const router = express.Router();


async function authSheets() {
    //Function for authentication object
    const auth = new google.auth.GoogleAuth({
      keyFile: "keys.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  
    //Create client instance for auth
    const authClient = await auth.getClient();
  
    //Instance of the Sheets API
    const sheets = google.sheets({ version: "v4", auth: authClient });
  
    return {
      auth,
      authClient,
      sheets,
    };
  }
  

  
  router.get("/getdata", async (req, res) => {
    const { sheets } = await authSheets();
    let company_name=req.query.company_name;
    let data={
        "gpt":{
            "company":{},
            "competitors":[]
        }
   
    };
   let company_available=false;
    if ((await sheets.spreadsheets.get({ spreadsheetId: process.env.DATABASE_ID })).data.sheets
      .map(sheet => {
        if( sheet.properties.title == company_name)
        {
           company_available=true
        }
       
      })) {
    }
    if(company_available)
    {
    // Read rows from spreadsheet
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId:  process.env.DATABASE_ID,
      range: company_name,
    });

    let competitors=[];
    getRows.data.values.forEach((element,index) => {

        if(index>=1)
        {
            if(element[1]==0)
          {
            data.company={
                "company_name":element[0],
                    "Products_And_Services":element[2]!=undefined?JSON.parse(element[2]):{},
                    "Industries_Served":element[3]!=undefined?JSON.parse(element[3]):[],
                    "Top_Clients":element[4]!=undefined?JSON.parse(element[4]):[],
                    "Market_Positioning":element[5]!=undefined?
                        JSON.parse(element[5])
                    :{
                        
                    },
                    "SWOT_Analysis":element[6]!=undefined?
                       JSON.parse(element[6])
                    :{
                        
                    }
               }
          }
          else
          {
            competitors.push(
                {
                    "company_name":element[0],
                    "Products_And_Services":element[2]!=undefined?JSON.parse(element[2]):{},
                    "Industries_Served":element[3]!=undefined?JSON.parse(element[3]):[],
                    "Top_Clients":element[4]!=undefined?JSON.parse(element[4]):[],
                    "Market_Positioning":element[5]!=undefined?
                        JSON.parse(element[5])
                    :{
                        
                    },
                    "SWOT_Analysis":element[6]!=undefined?
                        JSON.parse(element[6])
                    :{
                        
                    }
              }
            )
          }

        }
        
    });

    data.competitors=competitors;
    res.send(data);

  }
  else
  {
    res.send("Company Data not available");
  }
  });
  

  router.post("/updatedata", async (req, res) => {

    const { sheets } = await authSheets();
    let updateddata=[];
    let data=req.body.gpt;
    let companydata=data.company;
    let competitors=data.competitors;
    

    if ((await sheets.spreadsheets.get({spreadsheetId: process.env.DATABASE_ID})).data.sheets
    .filter(sheet => sheet.properties.title == companydata.company_name).length == 0) {
     sheets.spreadsheets.batchUpdate ({ 
      spreadsheetId: process.env.DATABASE_ID, 
      resource: {requests: [ {addSheet: {properties: {title: companydata.company_name }}}]}});
      
      
  }
  
   let temp=["Company","Competitor","Products And Services","Industries Served","Top Clients","Market Positioning","SWOT Analysis"];
    updateddata.push(temp);

    temp=[];
    temp.push(companydata.company_name)
    temp.push(0);
    temp.push(JSON.stringify(companydata.Products_And_Services));
    temp.push(JSON.stringify(companydata.Industries_Served));
    temp.push(JSON.stringify(companydata.Top_Clients));
    temp.push(JSON.stringify(companydata.Market_Positioning));
    temp.push(JSON.stringify(companydata.SWOT_Analysis));
    updateddata.push(temp);
    competitors.forEach((val,index)=>{
         temp=[];
         temp.push(val.company_name)
         temp.push(1);
         temp.push(JSON.stringify(val.Products_And_Services));
         temp.push(JSON.stringify(val.Industries_Served));
         temp.push(JSON.stringify(val.Top_Clients));
         temp.push(JSON.stringify(val.Market_Positioning));
         temp.push(JSON.stringify(val.SWOT_Analysis));
        updateddata.push(temp);
    });
   

    sheets.spreadsheets.values.update({
      spreadsheetId: process.env.DATABASE_ID,
      range: `${companydata.company_name}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: updateddata,
      },
    });

      res.send("Spreadsheet updated successfully");

  

  })
  
  


module.exports = router;
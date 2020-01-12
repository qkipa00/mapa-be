const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const Router = require("koa-router");
const Koa = require('koa');
const cors = require('koa-cors');
const HttpStatus = require("http-status");


const app = new Koa();
app.use(cors());

const router = new Router();


router.get("/sparql",async (ctx,next)=>{
  const data = await retrieveSparqlData();
  ctx.status = HttpStatus.OK;
  ctx.body = data;
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(4000);

async function retrieveSparqlData() {
  const context = {
    "@context": {
      "work": "http://data.czso.cz/resource/dataset/job-applicants",
      "salary": "http://data.czso.cz/resource/dataset/average-salaries",
      "bd": "http://data.czso.cz/ontology/",
      "refArea": "bd:refArea",
      "prMzda": "bd:prumernaMzda",
      "medianMzda": "bd:medianMzdy",
      "sex": "bd:sex",
      "medianMzdy": "bd:sex",
      "refPeriod": "bd:refPeriod",
      "neumisteniUchazeci": "bd:neumisteniUchazeciOZamestnani",
      "dosazitelniNeumisteniUchazeciOZamestnaniAbsolventiMladistvi": "bd:dosazitelniNeumisteniUchazeciOZamestnaniAbsolventiMladistvi",
      "neumisteniUchazeciOZamestnaniSeZdravotnimPostizenim": "bd:neumisteniUchazeciOZamestnaniSeZdravotnimPostizenim",
      "neumisteniUchazeciOZamestnaniAbsolventiMladistvi": "bd:neumisteniUchazeciOZamestnaniAbsolventiMladistvi",
      "dosazitelniNeumisteniUchazeciOZamestnani": "bd:dosazitelniNeumisteniUchazeciOZamestnani",
      "wsex": "bd:sex",
      "wrefArea": "bd:refArea",
      "wrefPeriod": "bd:refPeriod"
    }
  };

  // Create a GraphQL-LD client based on a client-side Comunica engine
  const comunicaConfig = {
    sources: require('./sources')
  };
  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
  const salaryQuery = `
  query {
      graph(_:salary)
      refArea @single
      prMzda @single
      refPeriod @single
      sex @single
      medianMzda @single
  }`;
  
  const workQuery = `
  query {
    graph(_:work)
    neumisteniUchazeci @single
    neumisteniUchazeciOZamestnaniAbsolventiMladistvi @single
    wsex @single
    wrefArea @single
    wrefPeriod @single
  }`;


  // Execute the query
  const salaryData = await client.query({ query: salaryQuery }).then(res => res.data);
  const workData = await client.query({ query: workQuery }).then(res => res.data);
  
  return {
    salaryData,
    workData
  }
}


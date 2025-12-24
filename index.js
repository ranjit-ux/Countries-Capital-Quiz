import express from "express"
import bodyParser from "body-parser"
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app=express();
const port = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === "production";

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

db.connect()
    .then(()=>console.log("Database Connected"))
    .catch(err=> console.log("Database Connection Error"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let quiz = [];
let totalcorrect=0;
let currentQuestion = {};

async function loadQuestions(){
    try{
        const result=await db.query("SELECT * FROM capitals");
        quiz=result.rows;
        console.log(`Loaded ${quiz.length} questions`);

    }catch(err){
        console.log("Error loading Questions",err);
    }
}

loadQuestions();

//get home
app.get("/", async(req,res)=>{
    totalcorrect=0;
    nextQuestion();
    console.log(currentQuestion);
    res.render("index.ejs", {question: currentQuestion});
});

//post a new question
app.post("/submit", (req,res)=>{
    let answer=req.body.answer?.trim() || "";
    if(currentQuestion.capital && currentQuestion.capital.toLowerCase()===answer.toLowerCase()){
        totalcorrect++;
        console.log(totalcorrect);

        nextQuestion();

        return res.render("index.ejs",{
            question:currentQuestion,
            wasCorrect: true,
            totalscore:totalcorrect,
        });
    }

    const finalScore = totalcorrect;

    totalcorrect=0;

    return res.render("index.ejs", {
        question: {country: "Game Over"},
        wasCorrect:false,
        totalscore:finalScore,
    });
    
});

function nextQuestion(){
    if(quiz.length===0){
        currentQuestion = {country: "Loading..."};
        return;
    }
    const randomQuestion = quiz[Math.floor(Math.random()*quiz.length)];

    currentQuestion=randomQuestion;
}

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});
const home = document.getElementById("home");
const projectlist = document.getElementById("projectlist");

const quizes = document.getElementById("quizes");
const projecttitle = document.getElementById("projecttitle");
const quiz = document.getElementById("quiz");
const hide1check = document.getElementById("hide1check");
const hide2check = document.getElementById("hide2check");

const quizedit = document.getElementById("quizedit");
const projectname = document.getElementById("projectname");
const quizscript = document.getElementById("quizscript");


let quizblue = localStorage.getItem("QuizBlue");
if(!quizblue) quizblue = {};
else quizblue = JSON.parse(quizblue);
let targetquiz = "";

quizscript.addEventListener("mousedown", (e) => {
    if (e.button == 1 || e.button == 2) {
        const value = quizscript.value;
        const start = quizscript.selectionStart, end = quizscript.selectionEnd;
        if(e.shiftKey){
            quizscript.value = value.substring(0, start) + "$$<" + value.substring(start, end) + ">$$" + value.substring(end);
            quizscript.selectionStart = start + 3;
            quizscript.selectionEnd = end + 3;
        }
        else {
            quizscript.value = value.substring(0, start) + "$<" + value.substring(start, end) + ">$" + value.substring(end);
            quizscript.selectionStart = start + 2;
            quizscript.selectionEnd = end + 2;
        }
        e.preventDefault();
    }
});
quizscript.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

/* Script parser */

function isQScriptValid(value){
    const lines = value.split("\n");
    let wordcount = 0;
    let quizcount = 0;
    for(let line of lines){
        let index1 = line.indexOf("$<"), index2 = 0;
        while(1){
            index2 = line.indexOf(">$", index2+1);
            if(index1 < 0 && index2 < 0)break;
            if(index1 >= index2 || index1 == -1  || index2 == -1)return [wordcount, wordcount+line.length];
            index1 = line.indexOf("$<", index1+1);
            if(index1 >= 0 && index1 <= index2)return [wordcount, wordcount+line.length];
            quizcount++;
        }
        wordcount+=line.length+1;
    }
    return [-1, quizcount];
}

function onCreateTest(){
    quiz.innerHTML = "";
    if(!(targetquiz in quizblue))return;
    const value = quizblue[targetquiz].script;
    const lines = value.split("\n");
    let text = "";
    for(let line of lines){
        if(line.length == 0)continue;
        line = line.replaceAll("$$<", "<span class='quizspan quizspan2'>");
        line = line.replaceAll("$<", "<span class='quizspan quizspan1'>");
        line = line.replaceAll(">$$", "</span>");
        line = line.replaceAll(">$", "</span>");
        text+="<p>" + line + "</p>";
    }
    quiz.innerHTML = text;
    let quizspans = document.getElementsByClassName("quizspan");
    let i=0;
    for(const quizspan of quizspans){
        quizspan.dataset.index=i;
        quizspan.addEventListener("click", onClickQuizSpan);
        if(quizblue[targetquiz].progress[i]==0)quizspan.classList.add("hide");
        if(quizblue[targetquiz].bookmark[i]==1)quizspan.classList.add("bookmark");
        i++;
    }
    setActiveQuestion();
}

function onHideBookmarks(){
    if(!(targetquiz in quizblue))return;
    let quizspans = document.getElementsByClassName("quizspan");
    let i=0;
    for(const quizspan of quizspans){
        if(quizblue[targetquiz].bookmark[i]==1){
            quizspan.classList.add("hide");
            quizblue[targetquiz].progress[i]=0;
        }
        i++;
    }
}

function onHideAll(){
    if(!(targetquiz in quizblue))return;
    if(!confirm("This will hide all the questions. Do you really want to continue?"))return;
    let quizspans = document.getElementsByClassName("quizspan");
    let i=0;
    for(const quizspan of quizspans){
        quizspan.classList.add("hide");
        quizblue[targetquiz].progress[i]=0;
        i++;
    }
}

function setActiveQuestion(){
    if(!(targetquiz in quizblue))return;
    let quizspans = document.getElementsByClassName("quizspan1");
    if(hide1check.checked){
        for(const quizspan of quizspans)quizspan.classList.add("active");
    }
    else{
        for(const quizspan of quizspans)quizspan.classList.remove("active");
    }
    quizspans = document.getElementsByClassName("quizspan2");
    if(hide2check.checked){
        for(const quizspan of quizspans)quizspan.classList.add("active");
    }
    else{
        for(const quizspan of quizspans)quizspan.classList.remove("active");
    }
}

function onClickQuizSpan(e){
    if(!(targetquiz in quizblue))return;
    let target = e.target;
    let index=parseInt(target.dataset.index);
    if(target.classList.contains("active")){
        if(target.classList.contains("hide")) {
            target.classList.remove("hide");
            quizblue[targetquiz].progress[index]=1;
        }
        else if(target.classList.contains("bookmark")){
            target.classList.remove("bookmark");
            quizblue[targetquiz].bookmark[index]=0;
        }
        else {
            target.classList.add("bookmark");
            quizblue[targetquiz].bookmark[index]=1;
        }
    }
}

/* Home Page */

function onHomepageInit(){
    const projects = Object.keys(quizblue);
    let text = "";
    for(const project of projects){
        text += "<li onclick=onLoadProject('"+project+"')>"+project+"</li>"
    }
    text += "<li onclick=onNewProject()>New Project</li>"
    projectlist.innerHTML = text;
}

onHomepageInit();

/* Edit Mode */

function onNewProject(){
    projectname.value = "No Name";
    quizscript.value = "";
    home.hidden=true;
    quizes.hidden=true;
    quizedit.hidden=false;
}

function onEditmode(){
    projectname.value = targetquiz;
    quizscript.value = quizblue[targetquiz].script;
    home.hidden=true;
    quizes.hidden=true;
    quizedit.hidden=false;
}

function onSaveProject(){
    const valid=isQScriptValid(quizscript.value);
    if(valid[0] >= 0){
        alert("Quiz Script has error!");
        quizscript.focus();
        quizscript.setSelectionRange(valid[0], valid[1]);
        return;
    }
    const name = projectname.value;
    if(name.length == 0){
        alert("Name the project!");
        return;
    }
    if(name in quizblue){
        if(!confirm("Project \"" + name + "\" already exists. Do you want to overwrite? (This will destroy the progress and bookmark of this project.)"))return;
    }
    let dummy1 = new Array(valid[1]);
    let dummy2 = new Array(valid[1]);
    for(let i=0;i<valid[1];i++)dummy1[i] = 0;
    for(let i=0;i<valid[1];i++)dummy2[i] = 0;
    quizblue[name] = {
        script:quizscript.value,
        progress:dummy1,
        bookmark:dummy2
    };

    targetquiz = name;
    projecttitle.innerText = name;
    home.hidden=true;
    quizes.hidden=false;
    quizedit.hidden=true;
    onCreateTest();
}

function onLoadProject(name){
    if(name in quizblue){
        targetquiz = name;
        projecttitle.innerText = name;
        home.hidden=true;
        quizes.hidden=false;
        quizedit.hidden=true;
        onCreateTest();
    }
}

function onBookmark(i){
    console.log(i);
}

window.onbeforeunload = function(e) {
    localStorage.setItem("QuizBlue", JSON.stringify(quizblue));
}

function onReturnToHome() {
    home.hidden=false;
    quizes.hidden=true;
    quizedit.hidden=true;
}

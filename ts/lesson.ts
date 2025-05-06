namespace lesson_ts {
const fetchText = i18n_ts.fetchText;
const assert = i18n_ts.assert;
const msg = i18n_ts.msg;
const $div = i18n_ts.$div;
const last = i18n_ts.last;
const parseMath = parser_ts.parseMath;
const renderKatexSub = parser_ts.renderKatexSub;
type  Term = parser_ts.Term;

class LessonReader {
    lines : string[];
    lineIdx : number = 0;
    divs : HTMLDivElement[] = [];

    constructor(div : HTMLDivElement, text : string){
        // this.div   = div;
        this.divs.push(div);
        this.lines = text.split("\n").map(x => x.trim());
    }

    makeH(level : number, text : string){
        while(level < this.divs.length){
            this.divs.pop();
        }

        const details = document.createElement("details");
        details.style.marginLeft = `${level * 10}px`;

        const summary = document.createElement("summary");
        summary.textContent = text;
        
        const div     = document.createElement("div");

        details.appendChild(summary);
        details.appendChild(div);

        last(this.divs).appendChild(details);

        this.divs.push(div);
    }

    makeTex(term : Term){
        const tex_div = document.createElement("div");
        last(this.divs).appendChild(tex_div);
        renderKatexSub(tex_div, term.tex());
    }

    readTheorem(header : string){
        const title = header.substring("@theorem".length).trim();
    }

    readLet(){

    }

    readIf(){
        // msg("start if");
        for(const line of this.readLine()){
            switch(line){
            case "@theorem":
            case "@lemma":
            case "@corollary":
                break;
            }
            if(line.startsWith("@then")){
                // msg("start then");

            }
            else if(line.startsWith("@end")){
                // msg("end if");

                break;
            }
            else{
                // msg(`parse:[${line}]`);
                try{
                    const root = parser_ts.parseMath(line);
                    this.makeTex(root);
                    // msg(`str:${root.str()}`);
                }
                catch(e){
                    if(e instanceof parser_ts.SyntaxError){
                        msg(`syntax err:[${line}]`);
                    }
                    else{
                        throw e;
                    }
                }
            }

        }
    }

    *readLine(){
        while(this.lineIdx < this.lines.length){
            const line = this.lines[this.lineIdx++];
            if(line.length == 0){
                continue;
            }

            yield line;
        }
    }

    *readLesson(){
        for(const line of this.readLine()){
            if(line.startsWith("@let")){
                this.readLet();
            }
            else if(line.startsWith("@if")){
                this.readIf();
            }
            else if(line.startsWith("@theorem")){
                this.readTheorem(line);
            }

            switch(line[0]){
            case "#":{
                const k = line.indexOf(" ");
                if(k != -1 && "#".repeat(k) == line.substring(0, k)){
                    this.makeH(k, line.substring(k + 1).trim());
                }
                break;
            }
            }
            yield line;
        }

    }


}

function expandAllDetails() {
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.open = true;
    });
}
  
export async function bodyOnLoad(){
    console.log("hello world");
    const [ origin, pathname, params] = i18n_ts.parseURL();
    msg(`[${origin}][${pathname}]`);
    const text = await(fetchText(`lib/lesson/lesson.txt?ver=${Math.random()}`));

    const div = $div("lessons-div");
    const lesson = new LessonReader(div, text);
    for(const line of lesson.readLesson()){
        // msg(`line:[${line}]`);
    }

    expandAllDetails();
}
}
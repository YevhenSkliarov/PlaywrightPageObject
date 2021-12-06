import HomePage from "./HomePage.js";
import TransalatePage from "./TranslatePage.js";

export default class App{
    constructor(page){
        this.home = new HomePage(page);
        this.translate = new TransalatePage(page)
    }
}
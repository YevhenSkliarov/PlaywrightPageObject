import { test } from '@playwright/test'
import App from '../tests/PageObjects/App.js'

const extendedTest = test.extend({
    app: async({page}, use) => {
        const app = new App(page);
        await app.home.open();
        use(app);
    }
})

export default extendedTest;
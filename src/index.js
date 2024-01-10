const { init } = require("./modules/init");
const { control } = require("./modules/control")
const { settings,books } = init();
control(settings,books);

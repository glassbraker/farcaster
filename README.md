# farcaster
Develop tools and application testing for UNLV capstone


Ubuntu:
first install node:
sudo apt install nodejs npm

Next install the farcaster stuff:
npm install @farcaster/miniapp-wagmi-connector

clone the repo

open a terminal in the root directory of repo, then run:
npm install

then run this after:
npm run dev

That will start the server, in the terminal it will tell you what local host to put in your browser, usually its "localhost:3000"

To edit the tabs in the app those are held in the directory:
/src/components/ui/tabs

the ui directory holds the header and footer to edit the menu

the files labled ***(old)
are the original files provided by farcaster, look in their for ideas on how to do things

import expiringUrlsWorkflow from '../../../assets/work/iocdf-expiring-urls/IOCDF-trial-license-system-portfolio-version.pdf'
import countChampFree from '../../../assets/work/count-champ/CountChampFree-signed.apk'

const projects = [
    {
        "title": "Cardano Blockchain Stake Pool",
        "thumbnailDescription" : "A blockchain stake pool on the Cardano network for processing transactions and minting blocks",
        "detailsDescription" : "This project is a fully functional Cardano network blockchain stake pool operating publically under the ticker CJP.  It includes a Core node, a Relay node, and a Cold Node.  It's fully integrated with the blockchain ecosystem to process transactions for the ADA community and mints blocks.",
        "objective": "Learn how to build and operate a blockchain network node.",
        "challenges": "Building custom blockchain transactions on my own server nodes was pretty hard the first few times.  It's a lot different building your own transactions rather than relying on another relay operator to build and sign transactions as most consumer-facing blockchain interactions do.", 
        "learned": "I have always had a high-level understanding of blockchain, but this project taught me more about the nuances of blockchain transactions, blockchain security, and block generation than I ever imagined.",
        "languages": ["Bash", "Haskell"],
        "liveLink": "https://captianjackadapool.com/",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/109230666-7528e400-7782-11eb-9898-49ea3e53c8de.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/109230151-a1903080-7781-11eb-9872-ae845216a9f5.png",
            "https://user-images.githubusercontent.com/44101756/109230157-a3f28a80-7781-11eb-919d-b50055e9f408.png",
            "https://user-images.githubusercontent.com/44101756/109230160-a48b2100-7781-11eb-8aee-35e5405df2ec.png",
            "https://user-images.githubusercontent.com/44101756/109230162-a523b780-7781-11eb-996c-222fac21b0df.png",
            "https://user-images.githubusercontent.com/44101756/109230164-a5bc4e00-7781-11eb-991b-de2a0cf2b5da.png",
            "https://user-images.githubusercontent.com/44101756/109230166-a5bc4e00-7781-11eb-90b2-714bdb2b09e2.png",
        ],
        "tags" : ["Back End", "Linux", "Security"],
        "additionalAssets" : []
    },
    {
        "title": "Algo Explorer",
        "thumbnailDescription" : "A series of industry standard sorting algorithms I built for practice",
        "detailsDescription" : "Algo Explorer was one of my favorite projects I have built. This contains some of the most common algorithms with each step animated to demonstrate how they operate.",
        "objective": "I wanted to learn how algorithms work better and how they differ from each other, so I wrote them from the ground up.",
        "challenges": "This was one of the most challenging projects I have worked on.  Not because writing the algorithms was particularly hard, but because I wanted to show the actual interactions the code I wrote was taking in real-time rather than using a gif or video.  I had to delay the code and do some challenging remounting steps in React to correctly render the behavior in animations with chart.js as the algorithm ran.", 
        "learned": "I learned a lot about how different algorithms behave and how the logic differs between them. I also learned how space and time could affect behaviors. Animating each step of my code helped drive these concepts home so I'm happy I decided to build that in. I plan to add more to this project and I'm really looking forward to adding some searches in.",
        "languages": ["React", "Node"],
        "liveLink": "https://algoexplorer.netlify.app/",
        "gitLink": "https://github.com/Eric-Lingren/algo-explorer",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/122433275-50d05d80-cf53-11eb-9413-7966df99361e.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/122444549-e670ea80-cf5d-11eb-8185-116a5c1f0091.png",
            "https://user-images.githubusercontent.com/44101756/122444763-1ddf9700-cf5e-11eb-9ca8-34ca0cf6d6a2.png",
            "https://user-images.githubusercontent.com/44101756/122441075-6bf29b80-cf5a-11eb-8dc5-6300d0ff672b.png",
            "https://user-images.githubusercontent.com/44101756/122441152-8298f280-cf5a-11eb-8722-4419200ae244.png",
        ],
        "tags" : ["Back End", "Front End", "Full Stack"],
        "additionalAssets" : []
    },
    {
        "title": "Project Euler",
        "thumbnailDescription" : "My Project Euler algorithm coding challenges.",
        "detailsDescription" : "An ongoing site that I am using to work through the Project Euler challenges that are found at projecteuler.net. All the logic is in the JS file and you can show the result of each question I have completed.",
        "objective": "Improve coding skills via complex challenges and algorithms.",
        "challenges": "Needing to optimize for efficiency and speed.", 
        "learned": "How to utilize console time to account for efficiency.",
        "languages": ["JavaScript", "HTML", "CSS"],
        "liveLink": "http://ericsprojecteuler.surge.sh/",
        "gitLink": "https://github.com/Eric-Lingren/project_euler",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473186-47bc4500-ced8-11ea-8d91-832fce3fa197.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88742201-dca08780-d0fe-11ea-9ea1-b77142aae721.png",
            "https://user-images.githubusercontent.com/44101756/88742205-de6a4b00-d0fe-11ea-8a6f-40d4e2f1541b.png",
            "https://user-images.githubusercontent.com/44101756/88742207-df02e180-d0fe-11ea-9135-25e110410db0.png",
            "https://user-images.githubusercontent.com/44101756/88742209-df9b7800-d0fe-11ea-8369-547d668652b5.png",
            "https://user-images.githubusercontent.com/44101756/88745450-576da080-d107-11ea-8be8-3838071e6fe5.png"
        ],
        "tags" : ["Challenges"],
        "additionalAssets" : ["https://projecteuler.net/"]
    },
    {
        "title": "Over The Wire",
        "thumbnailDescription" : "A gamified site that focuses on learning Linux, networking and security concepts.",
        "detailsDescription" : "This project is a series of coding challenges that are found at overthewire.com.  This is a gamified site geared towards learning web and server security and improving Linux skills.",
        "objective": "Learn what I don't know about security concepts for web and server development.",
        "challenges": "Pretty much everything beyond the first few levels has been a challenge for me.", 
        "learned": "My Linux skills have increased exponentially while working through these projects. The security aspects of server and web development has made this one of the most fun projects I have built.",
        "languages": ["Linux", "React", "JavaScript", "CSS"],
        "liveLink": "https://over-the-wire.netlify.app/",
        "gitLink": "https://github.com/Eric-Lingren/over_the_wire",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473309-7edf2600-ced9-11ea-9ccb-50a35c4a7567.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88749130-e8e11080-d10f-11ea-9082-bd832139238f.png",
            "https://user-images.githubusercontent.com/44101756/88749135-ea123d80-d10f-11ea-8663-144f72e5818a.png",
            "https://user-images.githubusercontent.com/44101756/88749139-eb436a80-d10f-11ea-975d-cae99817a091.png",
            "https://user-images.githubusercontent.com/44101756/88749142-ebdc0100-d10f-11ea-8bdf-4a4c0e71bd5c.png"
        ],
        "tags" : ["Linux", "Security"],
        "additionalAssets" : ["https://overthewire.org/wargames/"]
    },
    {
        "title": "IOD Analytics Dashboard",
        "thumbnailDescription" : "A data visualization aggregator to display user-product flows",
        "detailsDescription" : "This project was built with my team for our company. The repo and live site are both gated and not publically available. I was primarily responsible for the back end side of this project. It takes user data across seven different database tables in order to join and compile the data for the Chart.js and React front end to consume.",
        "objective": "To display user journey stories across particular product platforms in a clear manner.",
        "challenges": "Aggregating thousands of records across many tables in a performant manner for rendering.", 
        "learned": "Complex nested SQL table joins.",
        "languages": ["React, Chart.js, MySql, Node, Express"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89608129-78ce3b00-d831-11ea-9fcd-e6535752d478.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89608117-7370f080-d831-11ea-92df-b872a55a2c42.png",
            "https://user-images.githubusercontent.com/44101756/89608125-7835a480-d831-11ea-915c-623c8ba82673.png",
            "https://user-images.githubusercontent.com/44101756/89608126-7835a480-d831-11ea-9545-f7977269f7b5.png",
            "https://user-images.githubusercontent.com/44101756/89608127-78ce3b00-d831-11ea-9b24-ae8b9470af68.png",
            "https://user-images.githubusercontent.com/44101756/89608698-1118ef80-d833-11ea-9185-e2abf7b4785c.png"
        ],
        "tags" : ["Back End", "Front End", "Full Stack", "Database"],
        "additionalAssets" : []
    },
    {
        "title": "Metatrader MT4 Forex Robots",
        "thumbnailDescription" : "A collection of robot algorithms that trade the foreign currency markets built in MT4 for Metatrader platform integration.",
        "detailsDescription" : "This is a collection of 10 different robot algos I have built over the years for the MT4 FOREX trading platform.  Since these are all proprietary, the repo is not publically available, but you can view the performance of some of them via the MyFxBook Platform links above.",
        "objective": "Testing different automated revenue generation strategies.",
        "challenges": "Everything about these was hard, especially the weird MT4 coding syntax they use, which is a C++ based derivative language.", 
        "learned": "MT4 and how to manage the AWS servers that they run on.",
        "languages": ["MT4, AWS"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89599803-c3de5300-d81d-11ea-98d8-3263120dc749.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89599540-18cd9980-d81d-11ea-9853-bf3fba2f95c2.png",
            "https://user-images.githubusercontent.com/44101756/89599548-1d924d80-d81d-11ea-956a-1e53f934f8b0.png",
            "https://user-images.githubusercontent.com/44101756/89599590-3ef33980-d81d-11ea-9900-776dee595ed2.png"
        ],
        "tags" : ["Back End"],
        "additionalAssets" : [
            "https://www.myfxbook.com/portfolio/demo-5-profit-finch/2688114",
            "https://www.myfxbook.com/portfolio/current-live-acct/3298221",
            "https://www.myfxbook.com/portfolio/live/1913941"
        ]
    },
    {
        "title": "Oanda Python Forex Robots",
        "thumbnailDescription" : "A collection of robot algorithms built in python that trade the foreign currency markets via the Oanda platform.",
        "detailsDescription" : "This is a fully custom forex robot algorithm library built using the python Backtrader framework as reference, with full integration into the Oanda version 20 API schema. I built this platform after dissatsifactory results with other Python/Oanda platforms I was able to find on the market.",
        "objective": "Build a better Forex trading platform in Python that integrates directly with the Oanda API and can execute trades automatically.",
        "challenges": "The python itsself wasnt too bad since at this point I had built many python projects. Learning how to plan for scale, efficiency, and optimization within the python ecosystem was the biggest learning curve I had on this project.", 
        "learned": "Proper class design and inheritence for scale and coding efficiency",
        "languages": ["Python, Linux"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/oanda_v20_platform_public",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/108016137-1370b900-6fcf-11eb-9633-e5da02e50c4a.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/108016137-1370b900-6fcf-11eb-9633-e5da02e50c4a.png",
            "https://user-images.githubusercontent.com/44101756/108016138-153a7c80-6fcf-11eb-81f8-de911440e349.png",
            "https://user-images.githubusercontent.com/44101756/108016140-15d31300-6fcf-11eb-871c-75a5f75bdd95.png",
            "https://user-images.githubusercontent.com/44101756/108016142-166ba980-6fcf-11eb-9e92-ac631fdba3c5.png",
            "https://user-images.githubusercontent.com/44101756/108016143-17044000-6fcf-11eb-8528-75df299d8509.png"
        ],
        "tags" : ["Back End", "Linux"],
        "additionalAssets" : []
    },
    {
        "title": "Forex Server Bash Scripts",
        "thumbnailDescription" : "A series of Bash scripts to aid in deployment and configuration of python forex trading algos on Linux Digital Ocean servers.",
        "detailsDescription" : "This project is a series of bash scripts to improve the efficiency of my Linux server maintenance.  My servers run a series of Forex robot trading algorithms, and these scripts were built for faster deployment and scale of those robots.",
        "objective": "Faster management and maintenance of Linux server and provide a quicker rollout of many forex algo bots on the Oanda trading platform simultaneously for more rapid testing. ",
        "challenges": "Learning the syntax of Bash was a little tricky, as was working with arrays and for loops in the Bash language. ", 
        "learned": "Fundamental understanding of writing in Bash, language syntax and best practices.",
        "languages": ["Linux", "Bash", "Shell"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/oanda_server_scripts",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/107995107-44cf9180-6f9b-11eb-8671-48af7e910a01.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/107995098-4305ce00-6f9b-11eb-9b5d-8bc28dd9862b.png",
            "https://user-images.githubusercontent.com/44101756/107995103-439e6480-6f9b-11eb-8bad-a709996faa66.png",
            "https://user-images.githubusercontent.com/44101756/107995106-4436fb00-6f9b-11eb-9d9f-fb5ff6cd9eb3.png",
            "https://user-images.githubusercontent.com/44101756/107995107-44cf9180-6f9b-11eb-8671-48af7e910a01.png"
        ],
        "tags" : ["Linux", "Security", "Back End"],
        "additionalAssets" : ["https://drive.google.com/file/d/1HrapZaoP7-ioQxTQbIIxT_pV2xirI2mW/view?usp=sharing"]
    },
    {
        "title": "Forex Market Data Validator",
        "thumbnailDescription" : "A Python Script which validates, scrubs, and cleans historical market data",
        "detailsDescription" : "This is an interactive python script that allows the user to check a series of criteria of downloaded data before putting it to use.  It will check the existence of all files within a time series, verify the files contain data, alert if the data has low volume below a standard deviation, sort the data by timestamps, and remove any null rows from the data set.  Once the checks are complete, it will save the data into an excel file for later use.",
        "objective": "To ensure a clean and accurate dataset is available after downloading but before use.",
        "challenges": "Working with extremely large data sets (tens of millions of lines) in a performant and asynchronous manner", 
        "learned": "Reusable functions, working with pandas data frames, using python loggers, performing statistical evaluations within python",
        "languages": ["Python"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/duka/tree/master/data_validator",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/91771628-8791de80-eba0-11ea-9c3e-0cc30bb06e5f.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/91771617-83fe5780-eba0-11ea-8567-1bcefd355d93.png",
            "https://user-images.githubusercontent.com/44101756/91771619-852f8480-eba0-11ea-9e79-72f4c3121c5c.png",
            "https://user-images.githubusercontent.com/44101756/91771622-8660b180-eba0-11ea-8c18-5a39361cd52f.png",
            "https://user-images.githubusercontent.com/44101756/91771625-86f94800-eba0-11ea-9a7d-2ffa3230dd0a.png",
            "https://user-images.githubusercontent.com/44101756/91771627-86f94800-eba0-11ea-8459-844ecd9c9211.png"
            
        ],
        "tags" : ["Linux", "Back End"],
        "additionalAssets" : []
    },
    {
        "title": "Forex Market Data Scraper",
        "thumbnailDescription" : "A Python Script to download tick data for the equities, commodities and forex markets",
        "detailsDescription" : "This is an automated script which finds tick data for the currency, equity, and commodity markets and downloads the data. It uses asynchronous requests to re-obtain data if a fetch failed.  It also contains status progress bars and automatically builds all the unique URL's to request data from. ",
        "objective": "To be able to download accurate historical market data for backtesting trading algorithms. ",
        "challenges": "Checking for failed downloads are re-requesting the files.", 
        "learned": "Asynchronous fetching in Python, error handling, timing requests, and progress bars",
        "languages": ["Python"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/duka/tree/master/scraper",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/91767545-86a97e80-eb99-11ea-97b7-01a821894257.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/91767587-9759f480-eb99-11ea-8edc-f4dd6c6bcd3f.png",
            "https://user-images.githubusercontent.com/44101756/91767620-a9d42e00-eb99-11ea-994e-ee4345e83ee0.png",
            "https://user-images.githubusercontent.com/44101756/91767627-ae004b80-eb99-11ea-9d75-8369c3f77e58.png",
            "https://user-images.githubusercontent.com/44101756/91767630-afca0f00-eb99-11ea-938a-ea143ddbd5aa.png"
            
        ],
        "tags" : ["Linux", "Back End"],
        "additionalAssets" : []
    },
    {
        "title": "Chrome Doggo Extension",
        "thumbnailDescription" : "A chrome extension that shows a random dog image or gif.",
        "detailsDescription" : "This project is a custom built chrome extension that when clicked loads an iframe in the users current browser rendering a fully interactive react app with dog gifs and images",
        "objective": "Have some fun learning how to build a chrome extension.",
        "challenges": "Learning how to compile js files into one package for the extension to work.  It was quite challenging to get everything to load from a custom react app into the users active browser tab.", 
        "learned": "Chrome security, Extension requirements/patterns",
        "languages": ["JavaScript", "React", "Babel"],
        "liveLink": "https://chrome.google.com/webstore/detail/doggo-images/biaoklnpaodaoifepdddddobpejccdpj?hl=en",
        "gitLink": "https://github.com/Eric-Lingren/doggo-chrome-extension",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/101100084-20127300-3583-11eb-8a1c-8400f7eca084.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/101099156-7383c180-3581-11eb-9913-04c2dd9d52f0.png",
            "https://user-images.githubusercontent.com/44101756/101099160-741c5800-3581-11eb-86ee-f6b6ea74f097.png",
        ],
        "tags" : ["Front End"],
        "additionalAssets" : []
    },
    {
        "title": "Auto-Expiring Demo URL's",
        "thumbnailDescription" : "A back end system that creates and expires urls for issuing demo software licenses.",
        "detailsDescription" : "This system allows a sales representative to request a product demo to be sent from a contact record within Salesforce. It then sends a request to a Node server, which creates a unique key hash, embeds it in the URL, and emails the custom link to the client in an email to demo the requested product. It lives within a proprietary codebase to the reop is private, but I can share a few pieces of how it works.",
        "objective": "To create a way that my company could send lightweight versions of our products to prospective clients that would auto destroy after a seven-day window.",
        "challenges": "Hashing the keys into the URL and having react-browser-router check them upon component mounting.", 
        "learned": "A lot more about encryption and routing authentication",
        "languages": ["Node, MySql, React", "Salesforce"],
        "liveLink": "http://localhost:3000/digital-bursts/iocdf/b8db8717d2a33bd4b91438007b167266ed8f825451ca2c2efa259ab2c659a4d87e6f9a87aea7e6479bde9be45de7f460",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89600791-17ea3700-d820-11ea-9edc-fe3e35e565db.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89601036-c1312d00-d820-11ea-9026-680a20182456.png",
            "https://user-images.githubusercontent.com/44101756/89600418-43b8ed00-d81f-11ea-8e77-80dde4ba77ca.png",
            "https://user-images.githubusercontent.com/44101756/89600421-44ea1a00-d81f-11ea-8285-5da24b2c8a7f.png"
        ],
        "tags" : ["Back End, Database", "Security"],
        "additionalAssets" : [ expiringUrlsWorkflow ]
    },
    {
        "title": "Stripe Integration",
        "thumbnailDescription" : "An End-to-End Credit Card Processing Integration",
        "detailsDescription" : "This is a full stack credit card processing system that sends the data from the react front end elements to the Node.js back end for authentication and validation before sending the request securely to Stripe for processing.  This lives in a private repo, so the code can't be shared, but I can share some screenshots with details obscured away.",
        "objective": "To allow payment for different products.",
        "challenges": "Ensuring proper security and validation checks happened correctly.", 
        "learned": "Best practices for payment processors. ",
        "languages": ["React, Node.js"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89602233-81b81000-d823-11ea-9ad6-ec6f41d8b0e8.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89602629-6994c080-d824-11ea-9461-9b8df767e733.png",
            "https://user-images.githubusercontent.com/44101756/89602646-731e2880-d824-11ea-9a44-7419ea851f20.png",
            "https://user-images.githubusercontent.com/44101756/89602999-546c6180-d825-11ea-9cce-cb53ad94cd41.png",
            "https://user-images.githubusercontent.com/44101756/89602913-166f3d80-d825-11ea-8e62-7f5b2610e96c.png"
        ],
        "tags" : ["Back End", "Front End", "Security"],
        "additionalAssets" : []
    },
    {
        "title": "BU API Server",
        "thumbnailDescription" : "A Freelance Client Contract for a Custom an API Server built for Bryan University",
        "detailsDescription" : "This project was contract work for a client; therefore the URLs and repos are private, so I have included a few screenshots. This site has full Cross-Site Script and No-SQL injection protection.",
        "objective": "The client requested a full CRUD 'cheap' server that could accept and respond to requests securely and have clean data in a MongoDB architecture.",
        "challenges": "Getting DNS forwarding configured correctly with their provider's CNAME records.", 
        "learned": "Being patient while working with contracted clients due to our hectic schedules.",
        "languages": ["Node, Express, MongoDB, Mongoose"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89605249-51c03b00-d82a-11ea-938d-321209632454.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89605252-54229500-d82a-11ea-8bb1-d03f065ab729.png",
            "https://user-images.githubusercontent.com/44101756/89605256-571d8580-d82a-11ea-8758-62b87a5ef021.png",
            "https://user-images.githubusercontent.com/44101756/89605261-597fdf80-d82a-11ea-8857-09ad97d309de.png"
        ],
        "tags" : ["Back End", "Security"],
        "additionalAssets" : []
    },
    {
        "title": "Coding Challenges",
        "thumbnailDescription" : "A simple PrismJS site to display code snippets of some coding challenges I have done.",
        "detailsDescription" : "This simple PrismJS based site is to display code snippets of some coding challenges I have done.  This is an ongoing project that I add to when I have time.",
        "objective": "Practice and improve coding skills.",
        "challenges": "Trying to use js methods that I am unfamiliar with but more optimal.", 
        "learned": "Better method utilization and problem-solving.",
        "languages": ["React", "JavaScript", "CSS", "PrismJS"],
        "liveLink": "https://erics-coding-challenges.netlify.app/",
        "gitLink": "https://github.com/Eric-Lingren/coding_challenges",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473253-f3fe2b80-ced8-11ea-963c-efdb482a3a5d.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88745769-0f02b280-d108-11ea-8b60-a3bcc16b3cc4.png",
            "https://user-images.githubusercontent.com/44101756/88745773-1033df80-d108-11ea-996c-a424f674e2ec.png",
            "https://user-images.githubusercontent.com/44101756/88745776-10cc7600-d108-11ea-818f-541b12ac3e3a.png",
            "https://user-images.githubusercontent.com/44101756/88745778-11fda300-d108-11ea-9962-b38006b16c5c.png"
        ],
        "tags" : ["Challenges"],
        "additionalAssets" : []
    },
    {
        "title": "Python Image Webscraper",
        "thumbnailDescription" : "A Python Script to Crawl a Site and Download Images",
        "detailsDescription" : "This is the first web scraper I built. It accepts an array of site URL's and runs through all the HTML on each page looking for div tags with data-thumbnail attributes to find image URL's and downloads them. ",
        "objective": "Learn how to scrape and compile data from the web in an automated format.",
        "challenges": "Getting pip installed on my machine for package downloads was a total pain! I had too many conflicting versions of Python installed.", 
        "learned": "This project taught me the structure and methods of scraping Html code and how to utilize it, as well as how to properly set up a system for dependency use within the Python ecosystem.",
        "languages": ["Python"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/python-playground/tree/master/image-web-scraper",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89606290-c98f6500-d82c-11ea-8d2e-38b583d11b89.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89606282-c7c5a180-d82c-11ea-8c55-2968c9980389.png",
            "https://user-images.githubusercontent.com/44101756/89606285-c85e3800-d82c-11ea-820a-b34e673490d1.png"
        ],
        "tags" : ["Back End"],
        "additionalAssets" : []
    },
    {
        "title": "Teaching Intro to API's",
        "thumbnailDescription" : "Teaching a University class for their Full Stack Web Development API course",
        "detailsDescription" : "In the resource above, you will find a recording of me teaching an introduction to API class for Bryan University. This is published with the school's permission to demonstrate my skills and competency, not to be shared as a learning tutorial. ",
        "objective": "Help students understand API structure.",
        "challenges": "Communicating complex topics in an easy to understand way.", 
        "learned": "It's always better to have humor when you fail because it happens frequently. :)",
        "languages": ["Javascript, HTTP"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/91765259-e43bcc00-eb95-11ea-95e0-9d12dfbd76cf.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89609323-bf716480-d834-11ea-9a5e-99ce67be6360.png",
            "https://user-images.githubusercontent.com/44101756/89609326-c13b2800-d834-11ea-8ffa-7c4db409ea98.png",
            "https://user-images.githubusercontent.com/44101756/89610611-36f4c300-d838-11ea-9782-6b35e0f120b9.png"
        ],
        "tags" : ["Back End", "Teaching"],
        "additionalAssets" : [ "https://youtu.be/Ip6bFp66bR4" ]
    },
    {
        "title": "Teaching React Routing & Hooks",
        "thumbnailDescription" : "Teaching a University class for their Full Stack Web Development React course",
        "detailsDescription" : "In the resource above, you will find a recording of me teaching a React class for Bryan University covering front end routing and hooks. This is published with the school's permission to demonstrate my skills and competency, not to be shared as a learning tutorial. ",
        "objective": "Help students understand medium-advanced react topics.",
        "challenges": "Communicating complex topics in an easy to understand way", 
        "learned": "I love helping people understand code.",
        "languages": ["React"],
        "liveLink": "",
        "gitLink": "",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89610283-55a68a00-d837-11ea-81cf-b3beb7787f3f.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89610289-593a1100-d837-11ea-88b2-3a380601365b.png",
            "https://user-images.githubusercontent.com/44101756/89610292-5b9c6b00-d837-11ea-8dea-528cfba8765d.png",
            "https://user-images.githubusercontent.com/44101756/89610776-a5398580-d838-11ea-9e57-2155f08544fd.png",
            "https://user-images.githubusercontent.com/44101756/89610780-a79bdf80-d838-11ea-9b77-f591a3c74fb5.png"
        ],
        "tags" : ["Front End", "Teaching"],
        "additionalAssets" : [ "https://youtu.be/goqoOdKhnoA" ]
    },
    {
        "title": "Python Arithmetic Arranger",
        "thumbnailDescription" : "A free code camp project to learn data formatting & validation by arranging arrays into formatted strings",
        "detailsDescription" : "For this project, I was provided an array of math problems in string format and was required to perform a series of data validation and error handling before formatting the outputs in the desired way.",
        "objective": "Enhance my foundational Python scripting skills.",
        "challenges": "Using the test files in a Python ecosystem proved to be quite hard for me.", 
        "learned": "A better grasp of working withing a multi-file Python codebase.",
        "languages": ["Python"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/free-code-camp/tree/master/scientific-computing-with-python/projects/arithmetic-formatter",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89607289-5b986d00-d82f-11ea-949a-361c017e0c89.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89607268-520f0500-d82f-11ea-8cae-c4a36b9974b1.png",
            "https://user-images.githubusercontent.com/44101756/89607282-59cea980-d82f-11ea-9fbd-93919ab7a960.png",
            "https://user-images.githubusercontent.com/44101756/89607284-5affd680-d82f-11ea-9030-9a83713ad010.png"
        ],
        "tags" : ["Back End"],
        "additionalAssets" : []
    },
    {
        "title": "Custom NPM Packages",
        "thumbnailDescription" : "This is the full list of all the NPM packages I have built.",
        "detailsDescription" : "This is the list of all the NPM packages I have built.  One to removes all whitepace from a string, one performs enhanced date parsing methods.",
        "objective": "To publish custom packages.",
        "challenges": "Working within the NPM ecosystem.", 
        "learned": "How to utilize NPM properly, better understandin of JS file imports and exports.",
        "languages": ["Node.js", "NPM", "JavaScript"],
        "liveLink": "https://www.npmjs.com/package/@fxhacker/get_date",
        "gitLink": "https://github.com/Eric-Lingren/npm_projects",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473134-b8af2d00-ced7-11ea-9af8-4a817d5a4d45.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88473135-bbaa1d80-ced7-11ea-8e6a-892c0b1e19ba.png"
        ],
        "tags" : ["Back End"],
        "additionalAssets" : []
    },
    {
        "title": "Inventory Manager",
        "thumbnailDescription" : "A complex inventory management platform that tracks expirations and category relations",
        "detailsDescription" : "This project is unfinished but was a fun one to build a fully open back end architecture for users to create their own data structures and relations for categorizing inventory data. You can see the other planned features after logging in. This site is hosted on the free tier of Heroku so it may take some time to spin up, but if you want to access it, here are demo credentials: demoadmin@email.com demo123$",
        "objective": "To build a fully customizable inventory management platform for tracking items, groceries, etc.",
        "challenges": "My front end UI and responsiveness is terrible. I always find myself struggling with this since its not a strength.", 
        "learned": "Gained a better mastery of database architecture design.",
        "languages": ["React", "Node", "MySql", "Express"],
        "liveLink": "http://prep-inventory-manager.herokuapp.com/",
        "gitLink": "https://github.com/Eric-Lingren/inventory-manager",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/89673177-2594d080-d8a3-11ea-8bf4-359720470a34.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/89673179-275e9400-d8a3-11ea-82c1-7fee0379127c.png",
            "https://user-images.githubusercontent.com/44101756/89673181-288fc100-d8a3-11ea-8c4d-f63f81fb69ab.png",
            "https://user-images.githubusercontent.com/44101756/89673190-29c0ee00-d8a3-11ea-8f17-a261563c134e.png",
            "https://user-images.githubusercontent.com/44101756/89673195-2b8ab180-d8a3-11ea-8355-abbfc1a782a4.png"
        ],
        "tags" : ["Full Stack", "Database"],
        "additionalAssets" : []
    },
    {
        "title": "Employee CRUD",
        "thumbnailDescription" : "A full stack CRUD site for simple HR employee management.",
        "detailsDescription" : "A full-stack CRUD site that is for simple HR employee management.  Gives the availability to add new employees, update employees, delete employees, and get all employees. The live site is hosted on the free tier of Heroku, so it may take 15 seconds to load.",
        "objective": "Demonstrate and refresh my skills on a simple full stack project.",
        "challenges": "None.  Just a refresher project.", 
        "learned": "Getting better at ReactStrap",
        "languages": ["React", "MongoDB", "Mongoose", "ReactStrap", "Express", "CSS"],
        "liveLink": "http://crud-employees.herokuapp.com/",
        "gitLink": "https://github.com/Eric-Lingren/crud_employees",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472163-42a5c880-cecd-11ea-8054-d9415a0ce7a9.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472164-46394f80-cecd-11ea-84da-10e856802589.png",
            "https://user-images.githubusercontent.com/44101756/88749619-ea5f0880-d110-11ea-81d1-be5ac5f6637d.png",
            "https://user-images.githubusercontent.com/44101756/88749628-edf28f80-d110-11ea-85e2-d5671e1858fc.png"
        ] ,
        "tags" : ["Full Stack"],
        "additionalAssets" : []
    },
    {
        "title": "Infinity Investments",
        "thumbnailDescription" : "A full stack site which maps over large sets of historical trade data provided from a forex broker.",
        "detailsDescription" : "A full stack business site which maps over large sets of historical trade data provided from my forex broker. The app converts the data into interactive visualizations built with D3 and GreenSock.",
        "objective": "To get better at data visulization",
        "challenges": "Learning D3 was a total headache. My broker also wouldn't provide more than six months of data at a time via their API, so I needed to learn how to upload data via CSV into a MongoDB.", 
        "learned": "The D3 Framework",
        "languages": ["React", "Express", "MongoDB", "GreenSock", "D3", "JavaScript ES6"],
        "liveLink": "http://infinity-investments.herokuapp.com/",
        "gitLink": "https://github.com/Eric-Lingren/infinity_investments",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472361-18550a80-cecf-11ea-88f2-c72e1860c20b.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472362-1b4ffb00-cecf-11ea-9b36-8f971626b7b7.png",
            "https://user-images.githubusercontent.com/44101756/88750459-d4eade00-d112-11ea-8d5d-327b04fcd197.png",
            "https://user-images.githubusercontent.com/44101756/88750339-89383480-d112-11ea-840f-74b790ed442a.png"
        ],
        "tags" : ["Full Stack"],
        "additionalAssets" : []
    },
    {
        "title": "Count Champ",
        "thumbnailDescription" : "A React Native app that teaches players the nuances of card counting.",
        "detailsDescription" : "A CRUD React Native that teaches players the nuances of card counting.  Uses SQLite for database management of user stats in local storage and Axios for deck and card management. This was available for download on the Google Play store but was removed due to not updating it for the latest security updates, but you can get the signed sdk from the resource link above.",
        "objective": "Turn my blackjack project into a React Native app.",
        "challenges": "Learning Expo, debugging in a mobile environment, gradle and signing packages.", 
        "learned": "All of the above! :) ",
        "languages": ["React Native", "Android Studio", "SQLite", "Expo"],
        "liveLink": "",
        "gitLink": "https://github.com/Eric-Lingren/react_native/tree/master/count_champ",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472210-b051f480-cecd-11ea-962e-a9bc62ebdcb9.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472212-b3e57b80-cecd-11ea-92a0-b6b3520d68cc.png"
        ],
        "tags" : ["Front End"],
        "additionalAssets" : [countChampFree]
    },
    {
        "title": "Card Counters Blackjack",
        "thumbnailDescription" : "Not your average Blackjack game. It is designed to teach players how to count cards and maintains comprehensive game analytics.",
        "detailsDescription" : "This is a front-end React application that is not your average Blackjack game.  I built it during my bootcamp and it is designed to teach players how to count cards and maintains comprehensive game analytics.  It uses the Deck of Cards API to provide decks, cards, and shuffle functionality.",
        "objective": "To build a fully comprehensive blackjack trainer application.",
        "challenges": "This is the first project Iever used the React Context API in, so learning how to structure that was very challenging.  I could do it better now.", 
        "learned": "Context, and how crazy larger applications can get if you don't architect them correctly.",
        "languages": ["React", "ES6", "CSS"],
        "liveLink": "https://blackjack-for-cardcounters.netlify.app/#/",
        "gitLink": "https://github.com/Eric-Lingren/blackjack_project",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88471932-a6c78d00-cecb-11ea-8800-59d8ecf12fa6.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88749953-a8829200-d111-11ea-9c2d-cf68e26427b6.png",
            "https://user-images.githubusercontent.com/44101756/88471925-9dd6bb80-cecb-11ea-9014-a01a80f899bb.png",
            "https://user-images.githubusercontent.com/44101756/88749956-ac161900-d111-11ea-8743-700f0dd5d903.png",
            "https://user-images.githubusercontent.com/44101756/88749957-ac161900-d111-11ea-82e5-0d5319459121.png",
            "https://user-images.githubusercontent.com/44101756/88749958-acaeaf80-d111-11ea-8356-e0b4cde9d168.png"
        ],
        "tags" : ["Front End"],
        "additionalAssets" : []
    },
    {
        "title": "Crypto Minerz",
        "thumbnailDescription" : "This full stack e-commerce site was collaboratively built with 2 friends during my bootcamp.",
        "detailsDescription" : "This full stack e-commerce site was collaboratively built with 2 friends during my bootcamp. It uses the BestBuy API to authentication. Since we haven't kept our API credentials active beyond our schooling, the products now fail to load.",
        "objective": "Build a project collaboratively with other developers.",
        "challenges": "Coming to alignment on project scope and desired features. ", 
        "learned": "Proper use of Githup workflows in a multi-dev environment",
        "languages": ["ReactStrap", "JavaScript", "MongoDB", "Express", "Node.js", "CSS"],
        "liveLink": "http://cryptominerz.herokuapp.com/",
        "gitLink": "https://github.com/jmc90/vcommerce-v2",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472787-e2665500-ced3-11ea-9f0f-b1a5b71fa729.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472790-e5614580-ced3-11ea-83fc-de7ebbcc3bfe.png",
            "https://user-images.githubusercontent.com/44101756/88751032-044e1a80-d114-11ea-8fe4-ebee39479d38.png",
            "https://user-images.githubusercontent.com/44101756/88751040-06b07480-d114-11ea-8f06-54eb32d3f661.png"
        ],
        "tags" : ["Full Stack"],
        "additionalAssets" : []
    },
    {
        "title": "Smart Garden",
        "thumbnailDescription" : "A full stack app which allows adding, removing and saving plants or gardens. It also makes smart plant recommendations based on companion planting.",
        "detailsDescription" : "This is a MERN full stack app built during my bootcamp. It makes Axios requests to a MongoDB, which allows adding, removing, and saving plants or gardens. It also provides custom plant recommendations based on companion planting.  It is hosted on the free tier of Heroku, so it may take 15 seconds for the live site to spin up.",
        "objective": "Build a platform I could use to quickly see which plants I should place next to each other in my garden. ",
        "challenges": "Modifying dom elements correctly in React through mapping.", 
        "learned": "This project gave me a much better understanding of structuring data within a database.",
        "languages": ["React", "MongoDB", "Express", "Mongoose", "Node.js", "JavaScript ES6", "CSS"],
        "liveLink": "https://smart-garden-planting.herokuapp.com/",
        "gitLink": "https://github.com/Eric-Lingren/smartgarden",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472883-f068a580-ced4-11ea-8d02-bfac66bd1cc0.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472885-f199d280-ced4-11ea-9742-a5f00c352021.png",
            "https://user-images.githubusercontent.com/44101756/88751807-a1f61980-d115-11ea-9c94-bfec64430d9a.png",
            "https://user-images.githubusercontent.com/44101756/88751812-a589a080-d115-11ea-90dd-ea9bbae0e956.png",
            "https://user-images.githubusercontent.com/44101756/88751813-a6223700-d115-11ea-987c-63cd4b528ec1.png"
        ],
        "tags" : ["Full Stack"],
        "additionalAssets" : []
    },
    {
        "title": "Canvas Fun",
        "thumbnailDescription" : "Several projects built using constructor functions and canvas to show fun DOM interactions.",
        "detailsDescription" : "This site contains several projects with a variety of different things I have built using constructor functions in Javascript ES5 and canvas to show the fun interactions you are able to have with the DOM.",
        "objective": "This was my first time working with HTML canvas and my goal with this project was to better understand its inner workings and to become more familiar with constructors and classes.",
        "challenges": "I was very weak in my understanding of objects in JavaScript before I began this project and learning how to scale those for use with constructors was quite difficult for me.", 
        "learned": "Canvas, constructors, and object reusability.",
        "languages": ["JavaScript ES5", "CSS"],
        "liveLink": "http://funwithcanvas.surge.sh/index.html",
        "gitLink": "https://github.com/Eric-Lingren/my_projects/tree/master/canvas_practice",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88472959-ea26f900-ced5-11ea-9777-c14848d2d072.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88472963-ed21e980-ced5-11ea-9ea6-73bc1e8634f5.PNG",
            "https://user-images.githubusercontent.com/44101756/88752112-54c67780-d116-11ea-8651-fa94793a5bf8.png",
            "https://user-images.githubusercontent.com/44101756/88752115-5859fe80-d116-11ea-91c0-8cf51da1bb10.png",
            "https://user-images.githubusercontent.com/44101756/88752119-58f29500-d116-11ea-8287-bc5e7f4bc609.png"
        ],
        "tags" : ["Front End"],
        "additionalAssets" : []
    },
    // {
    //     "title": "Colossal Adventure",
    //     "thumbnailDescription" : "A text-based RPG that utilizes readline-sync to accept user input and provide interaction directly within the console.",
    //     "detailsDescription" : "",
    //     "objective": "",
    //     "challenges": "", 
    //     "learned": "",
    //     "languages": ["JavaScript ES5", "Node.js"],
    //     "liveLink": "",
    //     "gitLink": "https://github.com/Eric-Lingren/colossal_adventure",
    //     "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473024-9537b280-ced6-11ea-87bd-80855f6c4d78.png",
    //     "images" : [
    //         "https://user-images.githubusercontent.com/44101756/88473026-97017600-ced6-11ea-9239-cafe4e0b9b39.png"
    //     ],
    //     "tags" : [],
    //     "additionalAssets" : []
    // },
    {
        "title": "CSS Zen Garden",
        "thumbnailDescription" : "A fully responsive front-end site created as a clone of the original based solely on a PSD.",
        "detailsDescription" : "A fully responsive front-end site created as a clone of the original based solely on a PSD. This illustrates the ability to replicate ideas from a design team's mock-ups and implement those into a fully realized project. Landing page only.",
        "objective": "Replicate and existing front end project",
        "challenges": "Getting items to align properly", 
        "learned": "How to properly nest Html elements",
        "languages": ["HTML5", "CSS3"],
        "liveLink": "http://zengarden.surge.sh/",
        "gitLink": "https://github.com/Eric-Lingren/zen_garden_project",
        "thumbnailImage" : "https://user-images.githubusercontent.com/44101756/88473069-1db65300-ced7-11ea-9666-57a279f4f0e9.png",
        "images" : [
            "https://user-images.githubusercontent.com/44101756/88473070-1f801680-ced7-11ea-80d4-ad1e740dc53a.png"
        ],
        "tags" : ["Front End"],
        "additionalAssets" : []
    },
    // {
    //     "title": "This Portfolio Site",
    //     "thumbnailDescription" : "",
    //     "detailsDescription" : "",
    //     "objective": "",
    //     "challenges": "", 
    //     "learned": "",
    //     "languages": ["MT4"],
    //     "liveLink": "",
    //     "gitLink": "",
    //     "thumbnailImage" : "",
    //     "images" : [

    //     ],
    //     "tags" : ["Front End"],
    //     "additionalAssets" : ["https://xd.adobe.com/view/bd3cc9ca-c9d3-4e2c-5cd3-a0b8778a62a8-cb0d/"]
    // },
]

export default projects


// project template
// {
//     "title": "",
//     "thumbnailDescription" : "",
//     "detailsDescription" : "",
//     "objective": "",
//     "challenges": "", 
//     "learned": "",
//     "languages": ["MT4"],
//     "liveLink": "",
//     "gitLink": "",
//     "thumbnailImage" : "",
//     "images" : [

//     ],
//     "tags" : [""],
//     "additionalAssets" : []
// },
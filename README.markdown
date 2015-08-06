# widthPoints

Parses document styles and element inline styles and calculates maximal width waypoints for given element, for all window sizes.

    <html>
    <head>
        <style>
            .wrap {
                width: 200px;
            }
            @media screen and (min-width: 100px) and (max-width: 200px) {
                .wrap {
                    width: 100px;
                }
            }
        </style>
    </head>
    <body>
        <div class="wrap"></div>
        <script type="text/javascript" src="widthPoints.js"></script>
        <script>
            var element = document.querySelector('.wrap');
            var points = widthPoints(element); 

            console.log(points); // returns {0: 200, 100: 100, 200: 200, 1000: 1000, 2000: 200 }
        </script>
    </body>
    </html>

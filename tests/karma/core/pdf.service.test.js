describe('pdf', function () {

    beforeEach(module('OpenSlidesApp.core.pdf'));
    beforeEach(module('OpenSlidesApp.motions.lineNumbering'));

    var PdfMakeConverter,
        lineNumberingService;

    beforeEach(inject(function (_PdfMakeConverter_, _lineNumberingService_) {
        PdfMakeConverter = _PdfMakeConverter_;
        lineNumberingService = _lineNumberingService_;
    }));

    var defaultmargin = [0, 5],
        emptyline = JSON.stringify({
            "stack": [
                {"text": [], "margin": defaultmargin}]

        });


    describe('converting html to pdfmake', function () {
        it('converts a simple html string', function () {
            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(
                '<p>Hello <strong>strong</strong> world</p>', 'none'
            );
            expect(JSON.stringify(pdfmake[0])).toBe(emptyline);
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify({
                "stack": [
                    {
                        "text": [
                            {"text": "Hello "},
                            {"text": "strong", "bold": true},
                            {"text": " world"}
                        ], "margin": defaultmargin
                    }
                ]
            }));
            expect(JSON.stringify(pdfmake[2])).toBe(emptyline);
        });


        it('converts a simple list', function () {
            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(
                '<ul>' +
                '<li>Point 1</li>' +
                '<li>Point 2</li>' +
                '</ul>', 'none'
            );
            expect(JSON.stringify(pdfmake[0])).toBe(emptyline);
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify({
                "ul": [
                    {"stack": [{"text": [{"text": "Point 1"}]}]},
                    {"stack": [{"text": [{"text": "Point 2"}]}]}
                ]
            }));
            expect(JSON.stringify(pdfmake[2])).toBe(emptyline);
        });


        it('converts simple text including line numbers (inline)', function () {
            var inHtml = "<span>Test</span>",
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 5);
            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'inline');
            expect(JSON.stringify(pdfmake)).toBe(JSON.stringify([
                {
                    "stack": [{
                        "text": [
                            {"text": "1", "color": "gray", "fontSize": 5},
                            {"text": "Test"}
                        ], "margin": [0, 5]
                    }]
                }
            ]));
        });


        it('converts simple text including line numbers (outside)', function () {
            var inHtml = "<p>Test Test2 Test3</p>",
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 5);
            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');

            expect(JSON.stringify(pdfmake[0])).toBe(emptyline);
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify({
                "stack": [{"text": [], "margin": [0, 5]}, {
                    "columns": [{
                        "width": 20,
                        "text": "1",
                        "color": "gray",
                        "fontSize": 8,
                        "margin": [0, 2, 0, 0]
                    }, {"text": [{"text": "Test "}]}]
                }, {"text": []}, {
                    "columns": [{
                        "width": 20,
                        "text": "2",
                        "color": "gray",
                        "fontSize": 8,
                        "margin": [0, 2, 0, 0]
                    }, {"text": [{"text": "Test2 "}]}]
                }, {"text": []}, {
                    "columns": [{
                        "width": 20,
                        "text": "3",
                        "color": "gray",
                        "fontSize": 8,
                        "margin": [0, 2, 0, 0]
                    }, {"text": [{"text": "Test3"}]}]
                }]
            }));
            expect(JSON.stringify(pdfmake[2])).toBe(emptyline);
        });

        it('converts a list including line numbers (outside)', function () {
            var inHtml = "<ul><li>Item 1</li><li>Item 2</li></ul>",
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 10);

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');

            expect(JSON.stringify(pdfmake[0])).toBe(emptyline);
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify({
                "columns": [
                    {
                        "width": 20,
                        "stack": [
                            {"width": 20, "text": "1", "color": "gray", "fontSize": 8, "margin": [0, 2.35, 0, 0]},
                            {"width": 20, "text": "2", "color": "gray", "fontSize": 8, "margin": [0, 2.35, 0, 0]},
                            {"width": 20, "text": "3", "color": "gray", "fontSize": 8, "margin": [0, 2.35, 0, 0]},
                            {"width": 20, "text": "4", "color": "gray", "fontSize": 8, "margin": [0, 2.35, 0, 0]}
                        ]
                    },
                    {
                        "ul": [{
                            "stack": [
                                {"text": [{"text": "Item "}]},
                                {"text": [{"text": "1"}]}
                            ]
                        }, {
                            "stack": [
                                {"text": [{"text": "Item "}]},
                                {"text": [{"text": "2"}]}
                            ]
                        }
                        ]
                    }
                ],
                "margin": [0,10,0,0]
            }));
            expect(JSON.stringify(pdfmake[2])).toBe(emptyline);
        });

        it('does not break with non-line-break SPANs', function () {
            var inHtml = "<ol><li>Test line 1<span>empty span</span></li></ol>",
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 80);

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');

            // the actual result is's the point here; only that it doesn't throw an exception
            expect(JSON.stringify(pdfmake[0])).toBe(emptyline);
        });

        it('handles line breaks inside inline elements (outside)', function() {
            var inHtml = '<p>tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. <strong>At vero eos et accusam</strong> et justo duo dolores et ea rebum.</p>',
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 80);

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify(
                {
                    "stack": [
                        {"text": [], "margin": [0, 5]},
                        {
                            "columns": [
                                {
                                    "width": 20,
                                    "text": "1",
                                    "color": "gray",
                                    "fontSize": 8,
                                    "margin": [0, 2, 0, 0]
                                },
                                {
                                    "text": [
                                        {"text": "tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "},
                                        {"text": "At ", "bold": true}
                                    ]
                                }
                            ]
                        },
                        {"text": []},
                        {
                            "columns": [
                                {
                                    "width": 20,
                                    "text": "2",
                                    "color": "gray",
                                    "fontSize": 8,
                                    "margin": [0, 2, 0, 0]
                                },
                                {
                                    "text": [
                                        {"text": "vero eos et accusam", "bold": true},
                                        {"text": " et justo duo dolores et ea rebum."}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ));
        });

        it('handles line breaks inside inline elements (inline)', function() {
            var inHtml = '<p>tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. <strong>At vero eos et accusam</strong> et justo duo dolores et ea rebum.</p>',
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 80);

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'inline');
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify(
                {"stack": [
                    {"text": [
                        {"text": "1", "color": "gray", "fontSize": 5 },
                        {"text": "tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. "},
                        {"text": "At ", "bold": true },
                        {"text": "2", "color": "gray", "fontSize": 5},
                        {"text": "vero eos et accusam", "bold": true },
                        {"text": " et justo duo dolores et ea rebum."}
                    ], "margin": [0, 5]
                    }
                ]}
            ));
        });

        it('handles line breaks inside lists', function() {
            var inHtml = '<ol><li>Lorem ipsum dolor sit<br>amet, <u>consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat</u>, sed diam voluptua.</li></ol>',
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 80)

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify(
                {
                    "columns":[
                        {
                            "width": 20,
                            "stack": [
                                {"width": 20,"text": "1","color": "gray","fontSize": 8,"margin": [0, 2.35, 0, 0]},
                                {"width": 20,"text": "2","color": "gray","fontSize": 8,"margin": [0, 2.35, 0, 0]},
                                {"width": 20,"text": "3","color": "gray","fontSize": 8,"margin": [0, 2.35, 0, 0]}
                            ]
                        },
                        {"ol": [
                            {"stack": [
                                {
                                    "text": [
                                        {"text": "Lorem ipsum dolor sit"}
                                    ]
                                },
                                {
                                    "text": [
                                        {"text": "amet, "},
                                        {"text": "consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ","decoration": "underline"}
                                    ]
                                },
                                {
                                    "text": [
                                        {"text": "ut labore et dolore magna aliquyam erat","decoration": "underline"},
                                        {"text": ", sed diam voluptua."}
                                    ]
                                }
                            ]}
                        ]}
                    ],
                    "margin":[0,10,0,0]
                }
            ));
        });

        it('handles styled SPANs within Ps', function() {
            var inHtml = '<p><span style="font-weight: bold;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</span></p>',
                numberedHtml = lineNumberingService.insertLineNumbers(inHtml, 80)

            var instance = PdfMakeConverter.createInstance();
            var pdfmake = instance.convertHTML(numberedHtml, 'outside');
            expect(JSON.stringify(pdfmake[1])).toBe(JSON.stringify(
                {
                    "stack": [
                        {"text": [], "margin": [0, 5]},
                        {
                            "columns": [
                                { "width": 20, "text": "1", "color": "gray", "fontSize": 8, "margin": [0, 2, 0, 0]},
                                { "text": [
                                    { "text": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod ", "bold": true }
                                ]}
                            ]
                        },
                        {"text":[]},
                        {
                            "columns": [
                                { "width": 20, "text": "2", "color": "gray", "fontSize": 8, "margin": [0, 2, 0, 0] },
                                { "text": [
                                    { "text": "tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.", "bold": true }
                                ]}
                            ]
                        }
                    ]
                }
            ));
        });
    });
});


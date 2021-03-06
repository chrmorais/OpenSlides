(function () {

'use strict';

angular.module('OpenSlidesApp.mediafiles.states', [
    'gettext',
    'ui.router',
    //TODO: Add deps for mainMenuProvider
])

.config([
    'gettext',
    'mainMenuProvider',
    function (gettext, mainMenuProvider) {
        mainMenuProvider.register({
            'ui_sref': 'mediafiles.mediafile.list',
            'img_class': 'paperclip',
            'title': gettext('Files'),
            'weight': 600,
            'perm': 'mediafiles.can_see',
        });
    }
])

.config([
    'gettext',
    '$stateProvider',
    function (gettext, $stateProvider) {
        $stateProvider
        .state('mediafiles', {
            url: '/mediafiles',
            abstract: true,
            template: "<ui-view/>",
            data: {
                title: gettext('Files'),
            },
        })
        .state('mediafiles.mediafile', {
            abstract: true,
            template: "<ui-view/>",
        })
        .state('mediafiles.mediafile.list', {
            resolve: {
                mediafiles: function (Mediafile) {
                    return Mediafile.findAll();
                },
                users: function (User) {
                    return User.findAll().catch(
                        function () {
                            return null;
                        }
                    );
                },
            }
        });
    }
]);

}());

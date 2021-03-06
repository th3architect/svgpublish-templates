﻿
//-----------------------------------------------------------------------
// Copyright (c) 2017-2018 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.enableSidebar)
        return;

    var right = diagram.rightSidebar;
    var alwaysHide = diagram.alwaysHideSidebar;
    
    $("body").addClass(right ? "vp-sidebar-right" : "vp-sidebar-left");

    var sidebarWidth = 400;

    $("#sidebar-toggle").on("dragstart", function () {
        return false;
    });

    var storage;
    try { storage = window.localStorage; } catch (e) { }

    var defaultWidth = storage ? parseInt(storage.getItem("DiagramSidebarWidth")) : 0;
    if (defaultWidth > 0)
        sidebarWidth = defaultWidth;

    var maxWidth = $(window).width() - $("#sidebar-toggle").width() - 40;
    if (sidebarWidth >= maxWidth)
        sidebarWidth = maxWidth;

    var showSidebarSetting = storage ? storage.getItem("DiagramSidebarVisible") === '1' : 0;

    $("#sidebar-toggle").show();

    if (isSidebarEnabled() && !alwaysHide) {
        showSidebar(showSidebarSetting, 0);
    }

    var dragWidth;
    var dragClientX;

    var fnMouseMove = function (mouseMoveEvt) {
        if (dragClientX) {
            var width = dragWidth + (right ? -1 : 1) * (mouseMoveEvt.clientX - dragClientX);

            if (width < 0)
                width = 0;

            $("#diagram-sidebar").width(width + 'px').show();
            $("#sidebar-toggle").css(right ? "right" : "left", width + 'px');
        }
    };

    var fnMouseUp = function (mouseUpEvt) {

        $("iframe").css("pointer-events", "auto");

        $(document).off('mousemove', fnMouseMove);
        $(document).off('mouseup', fnMouseUp);

        var width = (right ? -1 : 1) * (mouseUpEvt.clientX - dragClientX) + dragWidth;

        if (width < 0)
            width = 0;

        if (Math.abs(mouseUpEvt.clientX - dragClientX) < 20) {
            showSidebar(width < 20, 400);
        } else {
            sidebarWidth = width;
            showSidebar(true, 0);
        }

        dragClientX = null;
    };

    $("#sidebar-toggle").on("mousedown", function (moseDownEvt) {

        if (moseDownEvt.button !== 0)
            return;

        $("iframe").css("pointer-events", "none");

        dragClientX = moseDownEvt.clientX;
        dragWidth = $("#diagram-sidebar").width();

        $(document)
            .on('mousemove', fnMouseMove)
            .on('mouseup', fnMouseUp);
    });

    function isSidebarEnabled() {
        return maxWidth > 600;
    }

    function showSidebar(show, animationTime) {

        if (show) {
            $("#diagram-sidebar")
			.show()
			.animate({
			    width: (sidebarWidth) + 'px'
			}, animationTime, function() {
                if (window.editor && window.editor.layout)
                    window.editor.layout();

                if (window.terminal && window.terminal.layout)
                    window.terminal.layout();

                if (diagram.enableSidebarHtml)
                    showSidebarHtml();
            });

            $("#sidebar-toggle")
			.addClass("rotated")
			.animate(
            right ? { right: (sidebarWidth - 2) + 'px' } : { left: (sidebarWidth - 2) + 'px' },
            animationTime);
        } else {
            $("#diagram-sidebar").animate({
                width: "0"
            }, animationTime, function () {
                $("#diagram-sidebar").hide();
            });

            $("#sidebar-toggle")
			.removeClass("rotated")
			.animate(
            right ? { right: "0" } : { left: "0" },
            animationTime);
        }

        if (isSidebarEnabled() && storage) {
            storage.setItem("DiagramSidebarVisible", show ? '1' : '0');
            storage.setItem("DiagramSidebarWidth", sidebarWidth);
        }
    }

    diagram.showSidebar = showSidebar;

    function showSidebarHtml(thisShapeId) {

        var shape = thisShapeId ? diagram.shapes[thisShapeId] : {};
        var $html = Mustache.render($('#sidebar-template').html(), shape);
        $("#sidebar-html").html($html);
    }

    if (diagram.enableSidebarHtml)
        diagram.selectionChanged.add(showSidebarHtml);
});

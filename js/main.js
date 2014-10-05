/*jshint devel: true*/
/*global TweenMax: true*/
// /*global FastClick: true*/
// /*global Modernizr: true*/
/*global Snap: true*/

$(document).ready(function(){

'use strict';

// SNAP

var $SNAP = (function(){

	console.log('SNAP');

	// var _private = xxx;

	return {};

})(); // end of SNAP

/*
 *
 */

// INITIALISATION

(function($S){

	console.log('INITIALISATION');

	// var $CM;

	$S.init = {

		getJson: function(){

			console.log('GET JSON');

			$S.json();

		}, // end of getJson

		useJson: function(){

			console.log('USE JSON');

			$S.svgElem.init();
			$S.introAnimation.init();
			$S.textureSelect.init();

		} // end of useJson

	}; // end of init

	return $S;

})($SNAP); // end of INITIALISATION

/*
 *
 */

// SETTINGS

(function($S){

	console.log('SETTINGS');

	$S.settings = {

		area: 620,
		jsonURL: 'js/products.json',
		// jsonData: null,
		// segments: null,
		thickness: 50,
		dom: {
			canvas: $('#canvas'),
			productmodule: $('#productModule')
		}

	}; // end of settings

	return $S;

})($SNAP); // end of SETTINGS

/*
 *
 */

// JSON

(function($S){

	console.log('JSON');

	var // $CM,
		$jsonURL = $S.settings.jsonURL;

	$S.json = function(){

		$.getJSON($jsonURL, function($jsonData){

			console.log('successfully got JSON data');
			console.log('JSON length = ' + $jsonData.length);

			$S.settings.jsonData = $jsonData;
			$S.settings.segments = $jsonData.length;

			$S.init.useJson();

		}).fail(function(){

			console.log('failed to get JSON data');

		});

	}; // end of json

	return $S;

})($SNAP); // end of JSON

/*
 *
 */

// CANVAS

(function($S){

	console.log('CANVAS');

	$S.canvas = new Snap('#canvas'); //new Snap(620, 620);

	return $S;

})($SNAP); // end of CANVAS

/*
 *
 */

// ELEMENTS

(function($S){

	console.log('ELEMENTS');

	var $CM,
		$canvasArea = $S.settings.area,
		$center = $canvasArea / 2,
		$totalSegments, // set after JSON data has been returned
		$thickness = $S.settings.thickness;

	$S.svgElem = {

		init: function(){

			$CM = $S.svgElem; // CURRENT MODULE
			$totalSegments = $S.settings.segments;
			
			var $degrees, $wedge, $texture, $segment;

			$degrees = $CM.degrees();
			$wedge = $CM.singleSegment.wedge($degrees); // create the wedge mask
			$texture = $CM.singleSegment.texture($wedge.width); // create texture group
			$texture = $CM.singleSegment.circleMask($texture); // mash texture group
			$segment = $CM.singleSegment.segment($texture, $wedge.mask); // create and mask segment
			
			// use the segment template to create the other segment instances
			$CM.compiledSegments($degrees, $segment);

		}, // end of init

		degrees: function(){

			return 360 / $totalSegments;

		}, // end of degrees

		singleSegment: {

			wedge: function($degrees){

				var $radians = $degrees * Math.PI / 180, // convert degrees to radians as that is what the tan() uses
					$wedgeHeight = $center, // find the height of the wedge
					$wedgeWidth = (Math.tan($radians / 2) * $wedgeHeight) - 8, // find the width of the wedge
					$mask;

				//  create wedge mask
				$mask = $S.canvas.polygon( // wedge cordinates
							$wedgeHeight - $wedgeWidth, 0, // point 1
							$wedgeHeight, $wedgeHeight, // point 2
							$wedgeHeight + $wedgeWidth, 0 // point 3
						).attr({fill: '#FFF'}); // white = content to show

				return {
					mask: $mask,
					width: $wedgeWidth
				};

                /*
                 *               (Y / 2)   (Y / 2)
                 *              ___________________
                 *              \        |        /
                 *               \       |       /
                 *                \      |      /
                 *                 \     | (X) /
                 *                  \    |    /
                 *                   \   |   /
                 *                    \__|__/
                 *                     \   /
                 *                      \ /
                 *                       v
                 */

			}, // end of wedge

			texture: function($wedgeWidth){

				var $textureWidth = $wedgeWidth * 2, // find the size to scale the image texture to
					$image = $S.canvas.image('img/texture/texture-0.jpg', $center - ($textureWidth / 2), 0, $textureWidth, $textureWidth), // create the image element
					$texture;

				$texture = $S.canvas.group($image) // create a group to hold the image (this will be used to animate the shape and have a mask applied to it)
							.attr({'class': 'texture'}); // add class name to texture group

				return $texture;

			}, // end of texture

			segment: function($texture, $wedgeMask){

				var $segment;

				// create segment group
				$segment = $S.canvas.group() // create a group to hold the texture group (this will have a mask applied to it)
							.add($texture)
							.attr({
								'class': 'segment', // give each segment a generic class...
								'data-ref': '0', // ... and a unique reference number
								'mask': $wedgeMask // add the wedge mask to the segment
							});

				return $segment;

			}, // end of segment

			circleMask: function($texture){

				var $innerCircle, $outerCircle, $mask;

				$innerCircle = $S.canvas.circle($center, $center, $center - $thickness);
				$outerCircle = $S.canvas.circle($center, $center, $center);

				// create mask
				$mask = $S.canvas.mask();
				// $mask.attr({'id': 'circleMask'});

				// add mask elements
				$mask.add($outerCircle);
				$mask.add($innerCircle);
				
				// set the areas to mask
				$outerCircle.attr({ fill: '#FFF' }); // white = content to show
				$innerCircle.attr({ fill: '#000' }); // black = content to hide

				// apply mask to texture group
				$texture.attr({ mask: $mask });

				return $texture;

			} // end of circleMask

		}, // end of singleSegment

		compiledSegments: function($degrees, $segment){

			var $i = 1,
				$rotate = $degrees,
				$this,
				$segments = $S.canvas.group($segment);

			for($i; $i < $totalSegments; $i++){

				// duplicate the original segment
				$this = $segment.clone();

				// rotate this segment to its unique angle
				$this.transform('r' + $rotate + ',' + $center + ',' + $center);

				// increase the angle each time a new segment is added to the DOM
				$rotate += $degrees;

				// put in a unique JSON reference
				$this.attr({'data-ref': $i});

				// console.log($this.find('> image'));

				$this.select('image').attr({'href': 'img/texture/texture-' + $i + '.jpg'});

				// add this segment to the group
				$segments.add($this);

				// give this group an ID
				$segments.attr({'id': 'segmentContainer'});

			} // end of loop

			return $segments;

		} // end of compiledSegments

	}; // end of svgElem

	return $S;

})($SNAP); // end of ELEMENTS

/*
 *
 */

// INTRO ANIMAION

(function($S){

	console.log('INTRO ANIMATION');

	var $CM;

	$S.introAnimation = {

		init: function(){

			$CM = $S.introAnimation; // CURRENT MODULE
			$CM.segments();

		}, // end of init

		segments: function(){

			var $ani = 0.5,
				$i = 0,
				$totalSegments = $S.settings.segments,
				$segmentContainer = $('#segmentContainer'),
				$this;

			for($i; $i < $totalSegments; $i++){

				console.log('animating polygon #' + $i);

				$this = $segmentContainer.find('> .segment[data-ref="' + $i + '"]').find('> .texture');

				TweenMax.fromTo($this, $ani, {
					'transform': 'translateY(50px)',
					opacity: 0
				},{
					'transform': 'translateY(0)',
					opacity: 1,
					delay: $i * 0.25
				});

			} // end of loop

		} // end of segments

	}; // end of introAnimation

	return $S;

})($SNAP); // end of INTRO ANIMAION

/*
 *
 */

// TEXTURE SELECT

(function($S){

	console.log('TEXTURE SELECT');

	var $CM, // CURRENT MODULE
		$ani = 0.5,
		$canvas, $productmodule, $segmentContainer, $allTextures, $ring;

	$S.textureSelect = {

		init: function(){

			$CM = $S.textureSelect;
			$canvas = $S.settings.dom.canvas;
			$productmodule = $S.settings.dom.productmodule;
			$segmentContainer = $canvas.find('> #segmentContainer');
			$allTextures = $segmentContainer.find('> .segment').find('> .texture');
			$ring = $productmodule.find('> #ring');

			$CM.listeners();

		}, // end of init

		listeners: function(){

			$segmentContainer.on('mouseenter', '.segment', function(){

				var $texture = $(this).find('> .texture');

				$CM.textureDormant($allTextures);
				$CM.textureActive($texture);
				$CM.rotateArrow($(this));

			});

			$canvas.on('mouseleave', function(){

				$CM.textureActive($allTextures);

			});

		}, // end of listeners

		textureActive: function($this){

			// console.log('active texture');

			TweenMax.to($this, $ani, {
				opacity: 1,
				transform: 'translateY(0)'
			});

		}, // end of segmentActive

		textureDormant: function($allTextures){

			// console.log('dormant texture');

			TweenMax.to($allTextures, $ani * 2, {
				opacity: 0.15,
				transform: 'translateY(20px)'
			});

		}, // end of segmentDormant

		rotateArrow: function($segment){

			var $totalSegments = $S.settings.segments,
				$ref = $segment.attr('data-ref'),
				$degrees = 360 / $totalSegments * parseInt($ref, 10);

			console.log('degrees = ' + $degrees);

			TweenMax.to($ring, $ani, {
				transform: 'rotate(' + $degrees + 'deg)'
			});

		} // end of rotateArrow

	}; // end of textureSelect

	return $S;

})($SNAP); // end of TEXTURE SELECT

/*
 *
 */

$SNAP.init.getJson();

}); // end of document.ready
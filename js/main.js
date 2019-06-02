Math.TAU = Math.PI * 2;
Math.PHI = 1.61803398875;

const STAGE_WIDTH = 1400;
const STAGE_HEIGHT = 787;

const SEED_BASE_RADIUS = 10;
const SEED_RADIUS_RATIO_VARIANCE = 0.05;

const DISTANCE_ORIGINAL = 20;
const DISTANCE_INCREMENT = SEED_BASE_RADIUS * 0.3;
const DISTANCE_INCREMENT_REDUCTION = 0.01;

const ANIMATION_INCREMENT = 0.0001;

let stage, main, angle_text;


$(function() {
	setStage();

	$('#controls').submit(() => false);
	$('#draw').click(() => {
		draw(get_angle('turn_ratio'))
	});

	$('#animate_start').click(() => animate(
		get_angle('angle_from'),
		get_angle('angle_to')
	));
	$('#animate_stop').click(() => createjs.Tween.removeTweens(main));

	angle_text = $('#cur_angle');

	$('#draw').click();
});

function get_state_width() {
	return STAGE_WIDTH;
}

function get_state_height() {
	return STAGE_HEIGHT;
}

function setStage() {
	stage = new createjs.Stage("flower");

	main = new createjs.MovieClip();
	main.x = Math.floor(get_state_width() / 2);
	main.y = Math.floor(get_state_height() / 2);

	stage.addChild(angle_text);
	stage.addChild(main);

	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	// createjs.Ticker.framerate = 40;
}

function get_num_seeds() {
	return Math.floor($('#num_seeds').val(), 10);
}

function get_angle(input_id) {
	return parseFloat($(`#${input_id}`).val());
}

function get_seed_scale() {
	return 1 + SEED_RADIUS_RATIO_VARIANCE * (Math.random() * 2 - 1);
}

function draw(turn_ratio) {
	createjs.Tween.removeTweens(main);
	do_draw(turn_ratio);
}

function do_draw(turn_ratio) {
	angle_text.text(turn_ratio);
	main.removeAllChildren();

	let cur_angle = 0;
	let cur_distance = DISTANCE_ORIGINAL;
	let cur_increment = DISTANCE_INCREMENT;
	let remaining_seeds = get_num_seeds();

	do {
		let circle = new createjs.Shape();

		circle.graphics
			.setStrokeStyle(2)
			.beginStroke('black')
			.beginFill('#eaaf36')
			.drawCircle(0, 0, SEED_BASE_RADIUS);

		circle.regX = circle.regy = SEED_BASE_RADIUS;
		circle.scaleX = circle.scaleY = get_seed_scale();

		circle.x = Math.cos(cur_angle) * cur_distance;
		circle.y = Math.sin(cur_angle) * cur_distance;

		cur_distance += cur_increment;
		cur_increment *= (1 - DISTANCE_INCREMENT_REDUCTION);
		cur_angle += turn_ratio * Math.TAU;

		main.addChildAt(circle, 0);
	}
	while(remaining_seeds--);

	stage.update();
}

let animating = false
let cur_angle;

function animate(angle_ratio_from, angle_ratio_to) {
	createjs.Tween.removeTweens(main);

	const angle_from = get_angle('angle_from');
	const angle_to = get_angle('angle_to');

	main.anim_angle = angle_from;

	createjs.Tween.get(main)
		.to({anim_angle: angle_to}, $('#duration').val() * 1000)
		.addEventListener('change', () => {
			do_draw(main.anim_angle);
		});
}

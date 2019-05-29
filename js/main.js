Math.TAU = Math.PI * 2;

const STAGE_WIDTH = 1400;
const STAGE_HEIGHT = 787;

const SEED_BASE_RADIUS = 10;
const SEED_RADIUS_VARIANCE = 0.5;

const DISTANCE_ORIGINAL = 20;
const DISTANCE_INCREMENT = SEED_BASE_RADIUS * 0.3;
const DISTANCE_INCREMENT_REDUCTION = 0.01;

const ANIMATION_INCREMENT = 0.0001;

let stage, main;


$(function() {
	setStage();

	$('#draw').click(() => draw(get_angle('angle_ratio')));
	$('#animate').click(() => animate(
		get_angle('angle_from'),
		get_angle('angle_to')
	));

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

	stage.addChild(main);

	// createjs.Ticker.timingMode = createjs.Ticker.RAF;
}

function get_num_seeds() {
	return Math.floor($('#num_seeds').val(), 10);
}

function get_angle(input_id) {
	return parseFloat($(`#${input_id}`).val());
}

function get_seed_radius() {
	return SEED_BASE_RADIUS + SEED_RADIUS_VARIANCE * (Math.random() * 2 - 1);
}

function draw(angle_ratio) {
	main.removeAllChildren();

	let cur_angle = 0;
	let cur_distance = DISTANCE_ORIGINAL;
	let cur_increment = DISTANCE_INCREMENT;
	let remaining_seeds = get_num_seeds();

	do {
		let circle = new createjs.Shape();
		let radius = get_seed_radius();

		circle.graphics
			.setStrokeStyle(2)
			.beginStroke('black')
			.beginFill('#eaaf36')
			.drawCircle(0, 0, radius);

		circle.regX = radius;
		circle.regy = radius;

		circle.x = Math.cos(cur_angle) * cur_distance;
		circle.y = Math.sin(cur_angle) * cur_distance;

		cur_distance += cur_increment;
		cur_increment *= (1 - DISTANCE_INCREMENT_REDUCTION);
		cur_angle += angle_ratio * Math.TAU;

		main.addChild(circle);
	}
	while(remaining_seeds--);

	stage.update();
}

let animating = false
let cur_angle;

function animate(angle_ratio_from, angle_ratio_to) {
	if (animating) return;
	animating = true;

	cur_angle = get_angle('angle_from');

	createjs.Ticker.addEventListener("tick", do_animate);
}

function do_animate() {
	draw(cur_angle);
	cur_angle += ANIMATION_INCREMENT;

	console.log(cur_angle);

	if (cur_angle >= get_angle('angle_to')) {
		createjs.Ticker.removeEventListener("tick", do_animate);
	}
}
// a few extra useful Math constants
Math.TAU = Math.PI * 2;
Math.SQRT5 = Math.sqrt(5);
Math.PHI = (1 + Math.SQRT5) / 2;

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 800;

const SEED_BASE_RADIUS = 10;
const SEED_RADIUS_RATIO_VARIANCE = 0.05;

const DISTANCE_ORIGINAL = 20;
const DISTANCE_INCREMENT = SEED_BASE_RADIUS * 0.3;
const DISTANCE_INCREMENT_REDUCTION = 0.01;

const ANIMATION_INCREMENT = 0.0001;

let stage, main, angle_text, tween;


$(function() {
	setStage();

	$('#controls').submit(() => false);
	$('#draw').click(() => {
		createjs.Tween.removeTweens(main);
		draw(get_angle('turn_ratio'))
	});

	$('#animate_start').click(() => {
		createjs.Tween.removeTweens(main);

		animate(
			get_angle('turn_ratio_from'),
			get_angle('turn_ratio_to'),
			$('#duration').val() * 1000
		);
	});
	$('#animate_play_pause').click(() => {
		if (tween) {
			tween.paused = !tween.paused;
		}
	});
	$('#animate_stop').click(() => {
		createjs.Tween.removeTweens(main)
		tween = null;
		$('#draw').click();
	});

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
}

function get_num_seeds() {
	return Math.floor($('#num_seeds').val(), 10);
}

function get_angle(input_id) {
	let angle = $(`#${input_id}`).val().replace(/\s+/g, '');

	if (/^-?[0-9.]+$/.test(angle)) {
		return parseFloat(angle);
	}

	// overwrite the known math constants and verify content is "sane"
	['pi', 'tau', 'phi', 'e', 'ln2', 'sqrt2'].forEach(constant => {
		angle = angle.replace(new RegExp(`\\b${constant}\\b`, 'gi'), Math[constant.toUpperCase()]);
	});

	// restrict eval input to sequence of multiplications and division only
	if (/^[0-9./*-]+$/.test(angle)) {
		try {
			return eval(angle);
		}
		catch(err) {}
	}

	const error_msg = `Input error: ${$(`#${input_id}`).val()}: Only allowed valid sequence of number or constants and / and * operators`;

	angle_text.text(error_msg);
	throw new SyntaxError(error_msg);
}

function get_seed_scale() {
	return 1 + SEED_RADIUS_RATIO_VARIANCE * (Math.random() * 2 - 1);
}

function draw(turn_ratio) {
	angle_text.text(turn_ratio);
	main.removeAllChildren();

	const constriction_rate = parseFloat($('#constriction_rate').val());

	let cur_angle = 0;
	let cur_distance = DISTANCE_ORIGINAL;
	let cur_increment = DISTANCE_INCREMENT;
	let remaining_seeds = get_num_seeds();

	do {
		let circle = new createjs.Shape();

		circle.graphics
			.setStrokeStyle(1.5)
			.beginStroke('black')
			.beginFill('#eaaf36')
			.drawCircle(0, 0, SEED_BASE_RADIUS);

		circle.scaleX = circle.scaleY = get_seed_scale();

		circle.x = Math.cos(cur_angle) * cur_distance;
		circle.y = Math.sin(cur_angle) * cur_distance;

		cur_distance += cur_increment;
		cur_increment *= constriction_rate;

		cur_angle += turn_ratio * Math.TAU;

		main.addChildAt(circle, 0);
	}
	while(remaining_seeds--);

	stage.update();
}

let animating = false
let cur_angle;

function animate(turn_ratio_from, turn_ratio_to, duration) {
	main.current_turn_ratio = turn_ratio_from;

	tween = createjs.Tween.get(main)
		.to({current_turn_ratio: turn_ratio_to}, duration);

	tween
		.addEventListener('change', () => {
			draw(main.current_turn_ratio);
		})
		.call(() => {
			tween = null;
		});
}

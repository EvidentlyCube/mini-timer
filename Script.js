$(document).ready(function(){
	var $container = $('.container');

	for(var i = 1; i <= 10; i++){
		$container.append('<div id="timer-'+i+'" class="timer-row" data-id="'+i+'">' +
			'<input type="text" class="description" value="">' +
			'<input class="time" data-time="0" value="0:00:00">'+
			'<button>Start</button>'+
			'</div>');
		var $t = $('#timer-' + i);
		$t.find('.description').val(readStorage('description-' + i, ''));
		$t.find('.time').attr('data-time', readStorage('time-' + i, 0));
		$t.find('.time').val(formatTime(readStorage('time-' + i, 0)));
	}


	var currentTimer = -1;
	var isRunning = false;
	var $timer =  null;
	var $timerInput = null;
	var startTimestamp = 0;
	var timerInitialTime = 0;
	
	$('div').each(function(){
		var $div = $(this);
		
		$div.find('button').click(function(){
			startTimer($div.attr('data-id'));
		});
		$div.find('.time').on('focus', modifiedTimer);
		$div.find('.time').on('blur', commitTimer);
		$div.find('.description').on('blur', handleDescriptionChanged);
	});
	
	setInterval(tick, 1000);
	setInterval(autoSave, 1000 * 60);
	
	function modifiedTimer(){
		var $input = $(this);
		var id = $input.parent().attr('data-id');
		if (id == currentTimer){
			stopCurrentTimer(false);
		}
	}

	function commitTimer(){
		var $input = $(this);
		var id = $input.parent().attr('data-id');
		
		var time = $input.val().replace(/\D/g, '');
		while(time.length < 5){
			time = "0" + time;
		}
		
		var totalTime = parseInt(time.substr(-2, 2))
			+ parseInt(time.substr(-4, 2)) * 60
			+ parseInt(time.substr(0, time.length - 4)) * 3600;
		$input.val(formatTime(totalTime));
		$input.attr('data-time', totalTime);
		storeTimer(id);
	}

	function handleDescriptionChanged(){
		var $input = $(this);
		var id = $input.parent().attr('data-id');
		storeTimer(id);
	}
	
	function tick(){
		if (!isRunning) return;
		
		$timerInput.val(formatTime(getFinalTime()));
		$timerInput.attr('data-time', getFinalTime());
	}
	function autoSave(){
		if (!isRunning) return;
		
		storeTimer(currentTimer);
	}
	
	function startTimer(id){
		var stopNext = id == currentTimer;
		stopCurrentTimer(true);
		if (stopNext){
			isRunning = false;
			return;
		}
		
		currentTimer = id;
		
		$timer = $('#timer-' + currentTimer);
		$timerInput = $timer.find('.time');
		$timer.find('button').text('Stop');
		startTimestamp = getSeconds();
		timerInitialTime = parseInt($timerInput.attr('data-time'));
		isRunning = true;
	}
	
	function stopCurrentTimer(updateTime){
		if (!isRunning){
			return;
		}
		
		var newTime = getFinalTime();
		
		$timer.find('button').text('Start');
		if (updateTime){
			$timerInput.attr('data-time', newTime);
			$timerInput.val(formatTime(newTime));
			
			storeTimer(currentTimer);
		}
		
		isRunning = false;
		currentTimer = -1;
	}
	
	function storeTimer(id){
		var $timer = $('#timer-' + id);
		localStorage.setItem('time-' + id, $timer.find('.time').attr('data-time'));
		localStorage.setItem('description-' + id, $timer.find('.description').val());
	}
	
	function getFinalTime(){
		var elapsedTime = getSeconds() - startTimestamp;
		return timerInitialTime + elapsedTime;
		
	}
	
	function formatTime(time){
		var second = time % 60;
		var minute = Math.floor(time / 60) % 60;
		var hour = Math.floor(time / 3600);
		second = second.toString();
		minute = minute.toString();
		hour = hour.toString();
		
		if (second < 10){ second = "0" + second; }
		if (minute < 10){ minute = "0" + minute; }
		
		return hour + ":" + minute + ":" + second;
	}
	
	function getSeconds(){
		return Math.floor(Date.now() / 1000);
	}
	
	function readStorage(id, defaultValue){
		if (localStorage.getItem(id) === null){
			return defaultValue;
		} else {
			return localStorage.getItem(id);
		}
	}
});
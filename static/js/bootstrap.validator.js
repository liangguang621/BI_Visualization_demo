// bootstrap3-validator.js
// 黄雪良, https://github.com/hxlniada/bootstrap3-validator
// Licensed under the MIT license.
$.fn.extend({
	validator: function(options) {
		var checkGroup = [];
		this.find('[data-validation]').each(function() {
			var $inputGroup = $(this),
				validation = $inputGroup.data('validation'),
				target = $inputGroup.data('target'),
				$element = $inputGroup.find('[name=' + target + ']');
			
			if ($element.prop('disabled') || $element.prop('readonly')) {
				return;
			}

			$element.on('change blur', function() {
				clearTimeout($element.data('validator-timer'));
				$.validator.checkValid(this, validation, $inputGroup);
			});

			$element.on('keyup', function() {
				var _this = this, timer;
				
				clearTimeout($element.data('validator-timer'));
				timer = setTimeout(function() {
					$.validator.checkValid(_this, validation, $inputGroup);
				}, $.validator.delay);

				$element.data('validator-timer', timer);
			});

			checkGroup.push({
				inputGroup: $inputGroup,
				element: $element,
				validation: validation
			});
		});

		this.data('checkGroup', checkGroup);
	},
	checkValid: function() {
		var checkGroup = this.data('checkGroup'),
			validateResult,
			firstInvalid;

		for (var i = 0; i < checkGroup.length; i++) {
			validateResult = $.validator.checkValid(checkGroup[i].element, checkGroup[i].validation, checkGroup[i].inputGroup, true);
			
			if (!validateResult && (typeof firstInvalid === 'undefined')) {
				firstInvalid = i;
			}
		}

		if (typeof firstInvalid === 'number') {
			checkGroup[firstInvalid].element.focus();
			return false;
		} else {
			return true;
		}
	}
});

$.extend({
	validator: {
		delay: 500,
		extend: function(options) {
			$.extend(true, this, options);
		},
		validRender: function($element, $inputGroup) {
			$inputGroup.removeClass('has-error').addClass('has-success').find('.help-block').text('');
		},
		invalidRender: function($element, $inputGroup, message) {
			$inputGroup.removeClass('has-success').addClass('has-error').find('.help-block').text(message);
		},
		remoteHanlder: function(value, data, $element, $inputGroup) {//远程校验比较特殊
			if (data === -1) {
				$element.data('remote', 'error');
				$.validator.invalidRender($element, $inputGroup, $.validator.messages.remote.error);
				return;
			}

			if (data.msg === 'valid_success') {
				$element.data('remote', 'success');
				$.validator.validRender($element, $inputGroup);
				return;
			} else {
				$element.data('remoteInvalids')[value] = $.validator.messages.remote.fail;
				$element.data('remote', 'fail');
				$.validator.invalidRender($element, $inputGroup, $.validator.messages.remote.fail);
			}
		},
		rules: {
			remote: function(value, url, $element, $inputGroup, _check) {
				if (!$element.data('remoteInvalids')) {
					$element.data('remoteInvalids', {});
				}
				//如果检测失败，直接返回失败的内容
				if (value in ($element.data('remoteInvalids'))) {
					$.validator.remoteHanlder.call(this, value, false, $element, $inputGroup);
					return $element.data('remoteInvalids')[value];
				}

				if (_check) {
					return true;
				}

				var data = {};
				
				data[$element.attr('name')] = value;

				$.get(url, $.extend(data, {_: +new Date()}), null, 'json')
					.done(function(data) {
						$.validator.remoteHanlder.call(this, value, data, $element, $inputGroup);
					})
					.fail(function() {
						$.validator.remoteHanlder.call(this, value, -1, $element, $inputGroup);
					});

				$element.data('remote', 'pending');

				return $.validator.messages.remote.pending;
			},
			required: function(value) {
				return !!value.length ? true : $.validator.messages['required'];
			},
			mobile: function(value) {
				return /^1[1-9]\d{9}$/.test(value) ? true : $.validator.messages['mobile'];
			},
			email: function(value) {
				return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value) ? true: $.validator.messages['email'];
			},
			url: function(value) {
				return /(https?|ftp|mms):\/\/([A-z0-9]+[_\-]?[A-z0-9]+\.)*[A-z0-9]+\-?[A-z0-9]+\.[A-z]{2,}(\/.*)*\/?/.test(value) ? true : $.validator.messages['url'];
			},
			webUrl: function(value) {
				return /(https?):\/\/([A-z0-9]+[_\-]?[A-z0-9]+\.)*[A-z0-9]+\-?[A-z0-9]+\.[A-z]{2,}(\/.*)*\/?/.test(value) ? true : $.validator.messages['webUrl'];
			},
			maxLength: function(value, maxLength) {
				maxLength = parseInt(maxLength, 10);
				return value.length > maxLength ? $.validator.messages.maxLength.replace('{{1}}', maxLength) : true;
			},
			minLength: function(value, minLength) {
				minLength = parseInt(minLength, 10);
				return value.length < minLength ? $.validator.messages.minLength.replace('{{1}}', minLength) : true;
			},
			range: function(value, range) {
				var min = parseInt(range.split(',')[0], 10),
					max = parseInt(range.split(',')[1], 10);

				return (value.length <= max && value.length >= min) ? $.validator.messages.range.replace('{{1}}', min).replace('{{2}}', max) : true;
			}
		},
		messages: {
			remote: {
				pending: 'Remote Validating……',
				error: 'Data send failed',
				fail: 'Invalid value'
			},
			required: 'This cannot be blank',
			mobile: 'Invalid phone number',
			email: 'Invalid email address',
			maxLength: 'Too long{{1}}',
			minLength: 'Too short{{1}}',
			url: 'Illegal url format',
			webUrl: 'Illegal (http/https) url format',
			range: 'Min-length {{1}} and max-length {{2}}'
		},
		//check表示是否是主动检测
		checkValid: function(element, validation, $inputGroup, _check) {
			var $element = $(element),
				value = $.trim($element.val()),
				i, ruleName, params, invalidValues, message,
				rules = validation.split('|');

			//如果检测到非法数据中存在该数据，就不需要再检测了
			invalidValues = $element.data('invalids') || [];

			if ($element.data('remote') === 'pending') {
				return false;
			}

			for (i = 0; i < rules.length; i++) {
				ruleName = rules[i].split('::')[0];
				params = rules[i].split('::')[1];

				//获取检测后的结果
				message = $.validator.rules[ruleName](value, params, $element, $inputGroup, _check);
				
				if (typeof message === 'string') {
					if (ruleName !== 'remote') {
						invalidValues.push(value);
					}
					$element.data('invalids', invalidValues);
					$.validator.invalidRender($element, $inputGroup, message);
					return false;
				}
			}
			$.validator.validRender($element, $inputGroup);
			return true;
		},
		hasValue: function(arr, value) {
			if (Array.prototype.indexOf) {
				return !!~arr.indexOf(value);
			}

			for (var i = 0; i < arr.length; i++) {
				if (arr[i] == value) {
					return true;
				}
			}

			return false;
		}
	}
});
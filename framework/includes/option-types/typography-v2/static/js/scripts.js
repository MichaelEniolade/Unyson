/*global fw_typography_v2_fonts, jQuery, _ */
( function ($) {
	$(document).ready(function () {
		var optionTypeClass = '.fw-option-type-typography-v2',
			googleFonts = JSON.parse(fw_typography_v2_fonts['google']),
			/**
			 * [ {'value': 'Font Family', 'text': 'Font Family'} ]
			 */
			fontsOptions = null,
			/**
			 * { 'Font Family': '<option ...' }
			 */
			fontsOptionsHTML = null,
			getFontsOptions = function(){
				if (fontsOptions === null) {
					fontsOptions = [];
					fontsOptionsHTML = {};

					_.each(fw_typography_v2_fonts['standard'], function (item) {
						fontsOptionsHTML[item] = '<option value="' + item + '">' + item + '</option>';
						fontsOptions.push({
							value: item,
							text: item
						});
					});

					_.each(googleFonts['items'], function (item) {
						fontsOptionsHTML[item['family']] = '<option value="' + item['family'] + '">' + item['family'] + '</option>';
						fontsOptions.push({
							value: item['family'],
							text: item['family']
						});
					});
				}

				return fontsOptions;
			},
			getFontsOptionHTML = function(fontFamily) {
				if (fontsOptionsHTML === null) {
					getFontsOptions();
				}

				return fontsOptionsHTML[fontFamily];
			},
			_to_ascii = {
				'188': '44',
				'109': '45',
				'190': '46',
				'191': '47',
				'192': '96',
				'220': '92',
				'222': '39',
				'221': '93',
				'219': '91',
				'173': '45',
				'187': '61', //IE Key codes
				'186': '59', //IE Key codes
				'189': '45'  //IE Key codes
			},
			shiftUps = {
				"96": "~",
				"49": "!",
				"50": "@",
				"51": "#",
				"52": "$",
				"53": "%",
				"54": "^",
				"55": "&",
				"56": "*",
				"57": "(",
				"48": ")",
				"45": "_",
				"61": "+",
				"91": "{",
				"93": "}",
				"92": "|",
				"59": ":",
				"39": "\"",
				"44": "<",
				"46": ">",
				"47": "?"
			},
			valueOnOpen = '';

		fwEvents.on('fw:options:init', function (data) {
			data.$elements.find(optionTypeClass +':not(.initialized)').each(function(){
				var $option = $(this);

				$option.find([
					'.fw-option-typography-v2-option .fw-option-typography-v2-option-size-input',
					'.fw-option-typography-v2-option .fw-option-typography-v2-option-line-height-input',
					'.fw-option-typography-v2-option .fw-option-typography-v2-option-letter-spacing-input'
				].join(', ')).keydown(function (e) {
					// Allow: backspace, delete, tab, escape, enter and .
					if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
							// Allow: Ctrl+A
						(e.keyCode == 65 && e.ctrlKey === true) ||
							//Allow -
						(e.keyCode == 109 ) ||
							// Allow: Ctrl+C
						(e.keyCode == 67 && e.ctrlKey === true) ||
							// Allow: Ctrl+X
						(e.keyCode == 88 && e.ctrlKey === true) ||
							// Allow: home, end, left, right
						(e.keyCode >= 35 && e.keyCode <= 39)) {
						// let it happen, don't do anything
						return;
					}
					// Ensure that it is a number and stop the keypress
					if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
						e.preventDefault();
					}
				});

				{
					var $fontFamilySelect = $option.find('.fw-option-typography-v2-option-family select[data-type="family"]');

					$fontFamilySelect
						.html(getFontsOptionHTML($fontFamilySelect.attr('data-value')))
						.selectize({
							onChange: function (selected) {
								var results = $.grep(googleFonts['items'], function (font) {
									return font['family'] === selected;
								});
								var $variations = this.$dropdown.closest(optionTypeClass).find('.fw-option-typography-v2-option-variation');
								var $subsets = this.$dropdown.closest(optionTypeClass).find('.fw-option-typography-v2-option-subset');

								var $style = this.$dropdown.closest(optionTypeClass).find('.fw-option-typography-v2-option-style');
								var $weight = this.$dropdown.closest(optionTypeClass).find('.fw-option-typography-v2-option-weight');

								if (results.length === 1) {
									var variations = '';
									var subsets = '';
									_.each(results[0]['variants'], function (variation) {
										variations += '<option value="' + variation + '">' + variation + '</option>';
									});
									_.each(results[0]['subsets'], function (subset) {
										subsets += '<option value="' + subset + '">' + subset + '</option>';
									});

									$variations.find('select[data-type="variation"]').html(variations);
									$variations.show();

									$subsets.find('select[data-type="subset"]').html(subsets);
									$subsets.show();
									$style.hide();
									$weight.hide();
								} else {
									$style.show();
									$weight.show();

									$variations.hide();
									$subsets.hide();
								}

								this.$wrapper.find('input[type="text"]').attr('data-fw-pressed-backspace', 'false');
							},
							onInitialize: function () {
								var self = this;
								this.$wrapper.find('input[type="text"]').attr('data-fw-pressed-backspace', 'false');
								this.$wrapper.find('input[type="text"]').on('keydown', function (e) {
									if (e.keyCode === 40) {
										$(this).attr('data-fw-pressed-backspace', 'true');
									} else {
										if ($(this).attr('data-fw-pressed-backspace') == 'false') {

											self.clear(true);

											var c = e.which;

											if (_to_ascii.hasOwnProperty(c)) {
												c = _to_ascii[c];
											}

											if (!e.shiftKey && (c >= 65 && c <= 90)) {
												c = String.fromCharCode(c + 32);
											} else if (e.shiftKey && shiftUps.hasOwnProperty(c)) {
												c = shiftUps[c];
											} else {
												c = String.fromCharCode(c);
											}
											$(this).val(c);

											$(this).attr('data-fw-pressed-backspace', 'true');
										}
									}
								});
							},
							onDropdownOpen: function($dropdown) {
								var selectize = $fontFamilySelect[0].selectize;

								valueOnOpen = selectize.getValue();

								selectize.clearOptions();

								_.each(getFontsOptions(), function(option){
									selectize.addOption({
										value: option.value,
										text: option.text
									});
								});

								selectize.refreshOptions();
							},
							onDropdownClose: function($dropdown) {
								var selectize = $fontFamilySelect[0].selectize,
									value = selectize.getValue();

								if (!value) {
									value = valueOnOpen;
								}

								_.each(getFontsOptions(), function(option){
									if (value !== option.value) {
										selectize.removeOption(option.value);
									}
								});

								selectize.setValue(value);
								selectize.refreshOptions(false);
							}
						});

					$fontFamilySelect.removeAttr('data-value');

					$fontFamilySelect.trigger('selectizeLoaded', [$fontFamilySelect[0].selectize]);
				}
			}).addClass('initialized');
		});
	});
}(jQuery));
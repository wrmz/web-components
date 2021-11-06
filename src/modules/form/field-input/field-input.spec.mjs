describe('FieldInput', function () {
    it('should pass attributes to input label component', async () => {
        const labelText = await page.evaluate(() => {
            document.body.innerHTML = `
                <field-input>
                    <label for="input-type-text" slot="label">label</label>
                    <input id="input-type-text" slot="input" type="text" placeholder="input">
                </field-input>
            `;
            let input = document.querySelector('field-input');
            const label = input.shadowRoot.querySelector('slot[name="label"]').assignedElements()[0];
            return label.innerHTML;
        });

        expect(labelText).toEqual('label');
    });

    it('should set and then remove invalid attribute from host', async () => {
		const result = await page.evaluate(async () => {
			document.body.innerHTML = `
				<field-input>
					<input id="input" slot="input" pattern="[A-Za-z ]+"/>
					<label for="input" slot="label">Input</label>
					<span slot="error">error</span>
				</field-input>
				`;
			const result = [];
			let input = document.querySelector('field-input');
			await new Promise(r => setTimeout(r, 10));
			const slottedInput = input.shadowRoot.querySelector('slot[name="input"]').assignedElements()[0];
			console.log('input:', slottedInput);
			slottedInput.value = 123;
			slottedInput.dispatchEvent(new Event('input'));
			await new Promise(r => setTimeout(r, 10));
			result.push(input.hasAttribute('invalid'));

			slottedInput.value = 'asd';
			slottedInput.dispatchEvent(new Event('input'));
			await new Promise(r => setTimeout(r, 10));
			result.push(input.hasAttribute('invalid'));

			return result;
		});
		expect(result[0]).toBeTrue();
		expect(result[1]).toBeFalse();
	});
});

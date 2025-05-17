export default async function Page() {
    return (
        <center>
            <h1>Binary Search</h1>
            <div>
                <fieldset>
                    <legend>Config</legend>
                    <label htmlFor="start">Starting Value</label>
                    <input type="number" id="start" name="start"/><br/>
                    <label htmlFor="end">Ending Value</label>
                    <input type="number" id="end" name="end"/><br/>
                </fieldset>
            </div>
        </center>
    )
}
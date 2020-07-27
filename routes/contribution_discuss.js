wiki.get(/^\/contribution\/(ip|author)\/(.*)\/discuss/, async function discussionLog(req, res) {
	if(config.getString('disable_contribution_list', '0') == '1') {
		res.send(await showError(req, 'disabled_feature'));
		return;
	}
	
	const ismember = req.params[0];
	const username = req.params[1];
	
	if(ismember == 'ip' && config.getString('ip2md5', '0') == '1') {
		res.send(await showError(req, 'disabled_feature'));
		return;
	}
	
	await curs.execute("select id, tnum, time, username, ismember from res \
				where cast(time as integer) >= ? and ismember = ? and username = ? order by cast(time as integer) desc", [
					Number(getTime()) - 2592000000, ismember, username
				]);
	
//			<li><a href="/contribution/${ismember}/${username}/document">[문서]</a></li>
//			<li><a href="/contribution/${ismember}/${username}/discuss">[토론]</a></li>
	
	var content = `
		<p>최근 30일동안의 기여 목록입니다.</p>
	
		<ol class="breadcrumb link-nav">
			<li><a href="/contribution/${ismember}/${username}/document">[문서]</a></li>
			<li><strong>[토론]</strong></li>
		</ol>
		
		<table class="table table-hover">
			<colgroup>
				<col>
				<col style="width: 25%;">
				<col style="width: 22%;">
			</colgroup>
			
			<thead id>
				<tr>
					<th>토론</th>
					<th>시간</th>
				</tr>
			</thead>
			
			<tbody id>
	`;
	
	const dd = curs.fetchall();
	
	for(row of dd) {
		await curs.execute("select title, topic from threads where tnum = ?", [row['tnum']]);
		const td = curs.fetchall()[0];
		
		content += `
				<tr>
					<td>
						<a href="/thread/${row['tnum']}">#${row['id']} ${html.escape(td['topic'])}</a> (<a href="/w/${encodeURIComponent(td['title'])}">${html.escape(td['title'])}</a>)
					</td>
					
					<td>
						${generateTime(toDate(row['time']), timeFormat)}
					</td>
				</tr>
		`;
	}
	
	content += `
			</tbody>
		</table>
	`;
	
	res.send(await render(req, `${username}의 토론 참여 내역`, content, {}));
});
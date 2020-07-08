#!/bin/env perl

use strict;
use CGI;
our ($rootdir, $ext, $annot_path, $image_path);
require './cgi/cgi.conf';

my $cgi = new CGI;
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});

use File::Basename qw/basename dirname/;
my $options = "";
for my $dir (sort({$a <=> $b} glob("$rootdir/*"))) {
    if (-d $dir){
        my $dirname = basename $dir;
        $options .= "<option value='$dirname'>$dirname</option>";
    }
};

print <<EOF;
<html>

  <head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>�ط������ѥ� ������</title>
        <script type="text/javascript" src="./js/login_default.js"></script>
  </head>

  <body>

	<h3>�ط������ѥ� ������</h3>
	<br>

	<form method=POST action="cgi/list.cgi">
	  <table>
		<tr>
		  <th align=left>
			̾��
		  </th>
		  <td>
			<select name="annotator_id">
			  <option value="annotator_a">annotator_a</option>
			  <option value="annotator_b">annotator_b</option>
			</select>
			<!--<input name="annotator_id" size="10">-->
		  </td>
		</tr>
		<tr>
		  <th align=left>
			�ѥ����
		  </th>
		  <td>
			<input type="password" name="password" size="10" maxlength="8">
		  </td>
		</tr>
		<tr>
		  <th align=left>
			�������å�
		  </th>
		  <td>
			<select name="corpus_set_id">
                            $options
			</select>
		  </td>
		</tr>
		<tr>
		  <th align=left>
			�������å�
		  </th>
		  <td>
			<input TYPE="checkbox" NAME="skip" VALUE="skip">��Ŭ������ɽ�����ʤ�
		  </td>
		</tr>
		<th>
		</th>
		<td>
		  <input type="submit" value="����">
		</td>
</tr>
</table>
</form>

</body>

</html>
EOF

print $cgi->end_html;

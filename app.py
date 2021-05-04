from flask import Flask
from flask import Flask, flash, redirect, render_template, request, session, abort, jsonify,send_file
from werkzeug.utils import secure_filename
from datetime import datetime
import pandas as pd
import os
import sys
import MySQLdb
from flask_mysqldb import MySQL
#import mysql.connector
import pytz
utc=pytz.utc
ist=pytz.timezone('Asia/Calcutta')
app= Flask(__name__ , static_url_path='/static')


app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST')
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'icg'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['SECRET_KEY'] = "rh\xa8\x9e\x08O\xc8\xb9\xf5\x19^\x7f\x90\x9b\xdf\xbf"

mysql = MySQL(app)



@app.route("/static/dashboard.html")
def static2():
    print("static content",str(session.get('logged_in')))
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return send_from_directory(os.path.join(app.instance_path, 'protected'),'dashboard.html')


@app.route('/login', methods=['POST'])
def do_admin_login():
    if request.form['password'] == 'pers0na': 
        if request.form['username'] == 'admin':
            session['logged_in'] = True
        else:
            un = request.form['username']
            cursor = mysql.connection.cursor()          
            my = "SELECT * FROM profile WHERE gid = %s "
            g = (un, )
            cursor.execute(my,g)
            data = cursor.fetchall()
            cursor.close()
            if (data):
                print("filtered the selected gid's timesheet")
                session['logged_in'] = True               
            else: 
                 flash('invalid credentials') 
   
    else:
        flash('wrong password!')
    return icg()

@app.route("/logout")
def logout():
    print('logged out')
    session['logged_in'] = False
    return hello()

@app.route("/static/associate.html")
def static_associate():
    print("static associate",str(session.get('logged_in')))
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return send_from_directory(os.path.join(app.instance_path, 'protected'),'associate.html')    

def hello():
    print("sss",str(session.get('logged_in')))
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file("dashboard.html")

@app.route("/icg" , methods=['GET'])
def icg():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:      
        try:
            session['username'] = request.form['username']
            un = request.form['username']
            
        except:
            un = session.get('username')
            pwd = session.get('password')     
        if un == 'admin':
           
            cursor = mysql.connection.cursor()
            cursor.execute('''SELECT * FROM profile''')
            data = cursor.fetchall()
            cursor.close()
            return render_template('icginfo.html', data = data)
        else:
            cursor = mysql.connection.cursor()
            cursor.execute("SELECT name FROM PROFILE WHERE gid = %s",[un])
            n = cursor.fetchone()
            cursor.close()
            cursor = mysql.connection.cursor()
            my = "SELECT * FROM timesheet WHERE gid = %s "
            g = (un, )
            cursor.execute(my,g)
            data = cursor.fetchall()
            cursor.close()
            return render_template('timesheet.html', data = data, un = un, n=n, change = True)

def homepage(msg):
    un = session.get('username')
    cursor = mysql.connection.cursor()
    cursor.execute('''SELECT * FROM profile''')
    data = cursor.fetchall()
    cursor.close()
    return render_template('icginfo.html', data = data, msg = msg, notif = True)

@app.route("/dashboard" , methods=['GET'])
def dashboard():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        cursor = mysql.connection.cursor(MySQLdb.DictCursor)
        cursor.execute('''SELECT * FROM profile''')
        data = cursor.fetchall()
        print ("db details")
        cursor.close()
        #return app.send_static_file("dashboard.html")
        return render_template('icginfo.html', data = data)

@app.route("/timesheet/<int:gid>",methods=['GET'])
def timesheet(gid):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT name FROM PROFILE WHERE gid = %s",[gid])
    n = cursor.fetchone()
    cursor.close()
    cursor = mysql.connection.cursor()
    my = "SELECT * FROM timesheet WHERE gid = %s "
    g = (gid, )
    cursor.execute(my,g)
    data = cursor.fetchall()
    print("filtered the selected gid's timesheet")
    cursor.close()
    return render_template('timesheet.html', data = data,un = gid,n=n, change=False, notif = False)


@app.route("/addProfile",methods=["POST","GET"])
def addProfile():
    print("inside add")
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if request.method == 'POST':
        gid = request.form['gid']
        name = request.form['name']
        role = request.form['role']
        email = request.form['email']
        contact = request.form['contact']      
        if not gid:
            flash('Please Input GID') 
        elif not name:
           flash('Please Input Name')    
        elif not email:
            flash('Please Input Email')
        else:        
            cur.execute("INSERT INTO profile (gid,name,role,email,contact) VALUES (%s,%s,%s,%s,%s)",[gid,name,role,email,contact])
            mysql.connection.commit()       
            flash ('New record created successfully')
    msgs = "enter"
    return homepage(msgs) 
    #return redirect('/icg')


@app.route("/addTimesheet",methods=["POST","GET"])
def addTimesheet():
    print("inside add")
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    if request.method == 'POST':
        gid = request.form['gid']
        tdate = request.form['tdate']
        customer_tasks = request.form['customer_tasks']
        customer_hours = request.form['customer_hours']
        process_tasks = request.form['process_tasks']
        process_hours = request.form['process_hours']
        learning_tasks = request.form['learning_tasks']
        learning_hours = request.form['learning_hours']
        if tdate == '':
            flash('Please Input date')
        if not customer_tasks :
           customer_tasks = "NA"  
        elif not customer_hours :
           customer_hours = 0 
        elif not process_tasks :
           process_tasks = "NA" 
        elif not process_hours :
           process_hours = 0
        elif not learning_tasks :
           learning_tasks = "NA"
        elif not learning_hours :
           learning_hours = 0 
        else:        
            cur.execute("INSERT INTO timesheet (gid,tdate,customer_tasks,customer_hours,process_tasks,process_hours,learning_tasks,learning_hours) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",[gid,tdate,customer_tasks,customer_hours,process_tasks,process_hours,learning_tasks,learning_hours])
            mysql.connection.commit()       
    flash("New record created succesfully!")
    return redirect('/icg') 

@app.route("/delete/<string:getid>",methods=["POST","GET"])
def delete_employee(getid):
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("DELETE FROM timesheet WHERE gid = %s", [getid])
    mysql.connection.commit()
    cur.close()
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("DELETE FROM profile WHERE gid = %s", [getid])
    mysql.connection.commit()       
    cur.close()
    flash('Record deleted successfully')
    msgs = "delete"
    return homepage(msgs)

@app.route("/deleteTimesheet/<string:getid>",methods=["POST","GET"])
def delete_timesheet(getid):
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("DELETE FROM timesheet WHERE entry_id = %s", [getid])
    mysql.connection.commit()       
    cur.close()
    flash("Record deleted succesfully")
    return redirect('/icg')

  
@app.route("/updateProfile/<int:gid>", methods = ['GET','POST'])
def updateProfile(gid):
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)  
    name = request.form['name']
    role = request.form['role']
    email = request.form['email']
    contact = request.form['contact']
    if not name:
        flash("Name must be entered")
        msgs = "enter"
        return homepage(msgs)
    cur.execute("UPDATE profile SET name = %s, role = %s, email =%s,contact=%s WHERE gid = %s",[name,role,email,contact,gid])
    mysql.connection.commit()
    cursor.close()   
    flash("Record successfully Updatedted")
    msgs = "Record successfully Updated"
    return homepage(msgs)

@app.route("/updateTimesheet/<int:entry_id>", methods = ['GET','POST'])
def updateTimesheet(entry_id):
    cursor = mysql.connection.cursor()
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)  
    tdate = request.form['tdate']
    customer_tasks = request.form['customer_tasks']
    customer_hours = request.form['customer_hours']
    process_tasks = request.form['process_tasks']
    process_hours = request.form['process_hours']
    learning_tasks = request.form['learning_tasks']
    learning_hours = request.form['learning_hours']
    cur.execute("UPDATE timesheet SET tdate = %s,customer_tasks = %s, customer_hours = %s, process_tasks =%s,process_hours=%s, learning_tasks = %s, learning_hours=%s WHERE entry_id = %s",[tdate,customer_tasks,customer_hours,process_tasks,process_hours,learning_tasks,learning_hours,entry_id])
    mysql.connection.commit()
    cur.execute("SELECT gid FROM timesheet WHERE entry_id = %s",[entry_id])
    gid = cur.fetchone()
    cursor.close()   
    flash("Record successfully Updated")
    #return timesheet(gid,msgs)
    return redirect("/icg")


@app.route("/associate",methods=['GET'])
def associate():
    print ("In associate", str(session.get("logged_in")))
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file("associate.html")

@app.route("/profile")
def profile():
    return app.send_static_file("profile.html")

@app.route("/upload",methods=['GET'])
def upload():
    return render_template("fileupload.html")

@app.route('/prediction', methods = ['POST'])
def prediction():
    if request.method == 'POST':
        f = request.files['file']
        timestamp = (datetime.now(utc)).strftime('%Y-%m-%d_%H-%M')   

        savedFileName = timestamp+'_' + f.filename
        import os
        currentDir = os.getcwd()
        targetFile = os.path.join(currentDir,"uploaddata",savedFileName)
        
        targetFile=savedFileName
        print(targetFile)
        f.save(secure_filename(targetFile))

        print("*filename*:",savedFileName ) 
        df= pd.read_csv(targetFile)
        print(df)
        df['customer_tasks']= df['customer_tasks'].fillna("NA")
        df['customer_hours']= df['customer_hours'].fillna(0)
        df['process_tasks']= df['process_tasks'].fillna("NA")
        df['process_hours']= df['process_hours'].fillna(0)
        df['learning_tasks']= df['learning_tasks'].fillna("NA")
        df['learning_hours']= df['learning_hours'].fillna(0)
        df['tdate'] = df['tdate'].fillna("non")
        print(df)
        length = len(df)
        tdate = df['tdate'].tolist()
        ct = df['customer_tasks'].tolist()
        ch = df['customer_hours'].tolist()
        pt = df['process_tasks'].tolist()
        ph = df['process_hours'].tolist()
        lt = df['learning_tasks'].tolist()
        lh = df['learning_hours'].tolist()
        cursor = mysql.connection.cursor()
        cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        gid = session.get('username')      
        for x in range(length)  :
            if tdate[x] == 'non':
                flash ("Records were not added due to Date field being empty!")
                return redirect("/icg")
            
            else:
                cur.execute("INSERT INTO timesheet (gid,tdate,customer_tasks,customer_hours,process_tasks,process_hours,learning_tasks,learning_hours) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",[gid,tdate[x],ct[x],ch[x],pt[x],ph[x],lt[x],lh[x]])
                mysql.connection.commit()
        flash("Records were added succesfully!" )
                # cur.execute("SELECT * FROM timesheet WHERE gid = %s",[gid])
                # data = cursor.fetchall()
                # cursor.close()
                # return render_template('timesheet.html', data = data, un = un, n=n, change = True, notif = True,msg = msg)
        return redirect("/icg")
# @app.route("/maximodashboard" , methods=['GET'])
# def maximodashboard():
#     if not session.get('logged_in'):
#         return render_template('login.html')
#     else:
#         return app.send_static_file("maximodashboard.html")

@app.route("/complete")
def complete():
    print("entered 1")
    cur = mysql.connection.cursor()
    print("entered 2")
    cur.execute("SELECT * FROM job_plan")
    print("entered 3")
    data = cur.fetchall()
    print("the data is" , data)
    return render_template('complete.html', data = data)





@app.route("/downloadfile/<int:tgid>",methods=["POST","GET"])
def downloadfile(tgid):
    #using pandas
    cur = mysql.connection.cursor()
    result = cur.execute("SELECT * FROM timesheet WHERE gid = %s", [tgid])
    data = cur.fetchall()
    rows = []
    columns = []
    for row in cur.fetchall():
        rows.appends(row)
    # for cols in cur.execute("SELECT * FROM profile").description:
    #     columns.appends(cols[0])
    
    df = pd.DataFrame(data = rows, columns = columns)
    df.reset_index(drop = True)
    print("before reading")
    print(df)
    sql = f""" 
    SELECT * FROM timesheet where gid = {tgid}
    """
    df = pd.read_sql(sql,con = mysql.connection)
    saved_file = str(tgid) + "_timesheet.csv"
    df.to_csv(saved_file,index = False)
    p = saved_file
    return send_file(p, as_attachment = True)

# @app.route("/activity")
# def activity():
#     un = session.get('username')
#     cursor = mysql.connection.cursor()
#     cursor.execute("SELECT name FROM PROFILE WHERE gid = %s",[un])
#     n = cursor.fetchone()
#     cursor.close()
#     cursor = mysql.connection.cursor()
#     my = "SELECT * FROM timesheet WHERE gid = %s "
#     g = (un, )
#     cursor.execute(my,g)
#     data = cursor.fetchall()
#     cursor.close()
#     return render_template('activities.html', data = data, un = un, n=n, change = True)

# port = os.getenv('VCAP_APP_PORT', '5000')
# if __name__ == "__main__":
#     app.secret_key = os.urandom(12)
#     #login_manager = LoginManager()
#     #login_manager.init_app(app)
#     app.run(host='159.122.225.87', port=int(port))
#     #app.run(host='127.0.0.1', port=int(port))
# if __name__ == "__main__":
#     app.run(debug=True)    

if __name__ == '__main__':  # Script executed directly?
   # print("Hello World! Built with a Docker file.")
    app.run(host="0.0.0.0", port=5000, debug=True,use_reloader=True)

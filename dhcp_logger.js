var HOST =  '0.0.0.0';
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var server67 = dgram.createSocket('udp4');

function parse_dhcp_packet( dhcp_payload_buffer )
{
  var bin = dhcp_payload_buffer;
  var bo = {};
  bo.OP = bin[0];
  bo.HTYPE = bin[1];
  bo.HLEN = bin[2];
  bo.HOPS = bin[3];
  bo.XID = bin.slice(4, 8);
  bo.SECS = bin.slice(8,10);
  bo.FLAGS = bin.slice(10,12);
  bo.CIADDR = bin.slice(12,16);
  bo.YIADDR = bin.slice(16,20);
  bo.SIADDR = bin.slice(20,24);
  bo.GIADDR = bin.slice(24,28);
  bo.CHADDR = bin.slice(28,28+16);
  bo.ABUFFER = bin.slice(28+16,28+16+192);
  bo.MAGICCOOKIE = bin.slice(28+16+192, 28+192+20);//bytes 236-240
  bo.OPTIONS = [];
  console.log("XID:");console.log(bo.XID);
  var i = 0;
  var blob = bin.slice(240, bin.length);
  console.log(blob);
  do{
    var ss = {};
    ss.code = blob[i];
    if( ss.code != 255 )
    {
      ss.length = blob[i+1];
      if( ss.code == 15 )
      {
        ss.data = blob.slice(i+2, i+2+ss.length).toString();
      }
      else
      {
        ss.data = blob.slice(i+2, i+2+ss.length);
      }
      console.log("CODE: " + ss.code 
            + " length: " + ss.length 
            + " data: ");
      console.log(ss.data);
      bo.OPTIONS[bo.OPTIONS.length] = ss;
      i += ss.length + 2;
    }
    else
    {
      break;
    }
  }while( i < bin.length );

  console.log( JSON.stringify( bo ) );
}
server.on('listening', function() {
  var address = server.address();
  console.log('UDP Server listening on ' + address.address + ":" + address.port);
  });

server.on('message', function( message, remote )
{
  console.log(remote.address + ":" + remote.port + " - " + message);
  var bin = Buffer( message );
  console.log(bin);
  parse_dhcp_packet( bin );
  //var b = Buffer("(response)");
  //server.send( b, 0, b.length, remote.port, remote.address, function(err, bytes){ if(err) throw err; });
});

server67.on('listening', function() {
  var address = server67.address();
  console.log('UDP Server listening on ' + address.address + ":" + address.port);
  });

server67.on('message', function( message, remote )
{
  console.log(remote.address + ":" + remote.port + " - " + message);
  var bin = Buffer( message );
  console.log(bin);
  parse_dhcp_packet( bin );
  //var b = Buffer("(response)");
  //server.send( b, 0, b.length, remote.port, remote.address, function(err, bytes){ if(err) throw err; });
});

server.bind(68, HOST);
server67.bind(67, HOST);

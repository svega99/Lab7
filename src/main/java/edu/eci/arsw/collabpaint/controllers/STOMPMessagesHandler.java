package edu.eci.arsw.collabpaint.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import edu.eci.arsw.collabpaint.model.Point;



@Controller
public class STOMPMessagesHandler {
	
	private ArrayList<Point> points = new ArrayList<Point>();

	
	@Autowired
	SimpMessagingTemplate msgt;
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
		synchronized (points){
            points.add(pt);

            if(points.size()>=3){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, points);
                points.clear();
            }
        }

        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);

    
	}
}